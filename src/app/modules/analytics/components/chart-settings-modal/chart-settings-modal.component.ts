import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { analyticsConfig } from '../../config/analytics.config';
import { LoaderService } from '../../../../services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-chart-settings-modal',
  templateUrl: './chart-settings-modal.component.html',
  styleUrls: ['./chart-settings-modal.component.scss']
})
export class ChartSettingsModalComponent implements OnInit {

  form: FormGroup;
  chartParameters: FormGroup;
  extraParameters: FormGroup;

  chart: any;

  analyticsConfig = analyticsConfig;
  yParams = [];
  xParams = [];
  zParams = [];
  dateParams = [];
  aggregations = [];
  color: '#000000';

  constructor(
    public dialogRef: MatDialogRef<ChartSettingsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private toastrService: ToastrService,
    private analyticsService: AnalyticsService,
  ) {
  }

  ngOnInit() {
    if (this.dialogData.chart) {
      this.chart = this.dialogData.chart;
    }

    this.form = this.formBuilder.group({
      name: [this.chart ? this.chart.name : null, Validators.required],
      chart_label: [this.chart ? this.chart.chart_label : null],
      type: [this.chart ? this.chart.type : null, Validators.required],
      db_table: [this.chart ? this.chart.db_table : null, Validators.required],
      group_by_date_param: [this.chart && this.chart.group_by_date_param ? this.chart.group_by_date_param : null, Validators.required],
      date_param: [this.chart ? this.chart.date_param : null, Validators.required],
    });

    this.setParameters();
    this.setExtraParameters();

    if (this.chart) {
      this.changeType({value: this.form.value.type});
      this.chartParameters.patchValue(this.chart.parameters);
    } else {
      this.changeType({value: null});
    }
  }

  private setParameters() {
    this.chartParameters = this.formBuilder.group({
      y: [null, Validators.required],
      x: [null, Validators.required],
      z: [null],
    });
    if (!this.form.get('parameters')) {
      this.form.addControl('parameters', this.chartParameters);
    }
  }

  private setExtraParameters() {
    const extraParameters = this.chart ? this.chart.extra_params : null;
    this.extraParameters = this.formBuilder.group({
      aggregation: [extraParameters ? extraParameters.aggregation : null, Validators.required],
      computation: [extraParameters && extraParameters.computation ? extraParameters.computation : null, Validators.required]
    });
    if (!this.form.get('extra_params')) {
      this.form.addControl('extra_params', this.extraParameters);
    }
  }

  changeTable(event) {
    if (this.form.value.extra_params.aggregation === 'COUNT') {
      this.yParams = analyticsConfig.exposedParams[event.value].slice(0);
    } else {
      this.yParams = analyticsConfig.numericParams[event.value].slice(0);
    }
    this.dateParams = analyticsConfig.dateParams[event.value].slice(0);
    this.zParams = analyticsConfig.exposedParams[event.value].slice(0);
    this.aggregations = analyticsConfig.aggregations;

    if (this.form.value.type === 'line') {
      this.xParams = analyticsConfig.dateParams[event.value].slice(0);
      this.chartParameters.get('x').setValue(this.xParams[0]);
    } else {
      this.xParams = analyticsConfig.exposedParams[event.value].slice(0);
    }
    this.chartParameters.patchValue({y: null, x: null, z: null});

    if (event.value === 'Rmq_sale' || event.value === 'Project_employee' || event.value === 'Cashier_ticket_2') {
      this.analyticsConfig.chartTypes = ['bar', 'pie', 'line'];
    } else {
      this.analyticsConfig.chartTypes = ['bar', 'pie', 'line', 'map'];
    }
  }

  changeType(event) {
    if (event.value === 'map') {
      this.form.removeControl('parameters');
      this.form.removeControl('extra_params');
      this.form.removeControl('group_by_date_param');
    } else {
      if (!this.form.get('parameters')) {
        this.form.addControl('parameters', this.chartParameters);
      }
      if (!this.form.get('extra_params')) {
        this.form.addControl('extra_params', this.extraParameters);
      }
      if (event.value !== 'pie') {
        if (!this.chartParameters.get('z')) {
          this.chartParameters.addControl('z', new FormControl( null));
        }
      } else {
        this.chartParameters.removeControl('z');
      }
      if (event.value === 'line') {
        if (!this.form.get('group_by_date_param')) {
          this.form.addControl('group_by_date_param', new FormControl( null, Validators.required));
        }
      } else {
        this.form.removeControl('group_by_date_param');
      }
      if (this.form.value.db_table) {
        this.changeTable({value: this.form.value.db_table});
      }
    }
  }

  changeYParam(event) {
    if (event.value === '*') {
      this.aggregations = ['COUNT'];
      this.extraParameters.get('aggregation').setValue('COUNT');
    }
  }

  changeAggregation(event) {
    if (event.value === 'COUNT') {
      this.yParams = analyticsConfig.exposedParams[this.form.value.db_table].slice(0);
    } else {
      this.yParams = analyticsConfig.numericParams[this.form.value.db_table].slice(0);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  async onCreate() {
    if (this.form.valid) {
      let analyticsChart = {
        ...this.form.value,
        dashboard_id: this.dialogData.dashboard_id,
        date_param: this.form.value.date_param
      };
      if (this.form.value.type === 'map') {
        analyticsChart = {
          ...analyticsChart,
          parameters: {
            x: analyticsConfig.mapParams[this.form.value.db_table][0],
            z: analyticsConfig.mapParams[this.form.value.db_table][1],
          }
        };
      }
      try {
        this.loaderService.enable();
        if (this.chart) {
          await this.analyticsService.updateChart(this.chart.id, analyticsChart);
          this.toastrService.success('The chart is updated successfully', 'Success');
        } else {
          await this.analyticsService.createChart(analyticsChart);
          this.toastrService.success('The chart is created successfully', 'Success');
        }
        this.dialogRef.close(true);
      } catch (e) {
        this.toastrService.error(e.error && e.error.message ? e.error.message : 'Something went wrong', 'Error');
      } finally {
        this.loaderService.disable();
      }
    }
  }

  onColorPickerChange(event) {
    this.form.get('color').setValue(event);
  }

  checkDisableParam(item: any, anotherField) {
    return item === this.form.value.parameters.y || item === this.form.value.parameters[anotherField];
  }

  checkDisableYParam(item: any) {
    return item === this.form.value.parameters.x || item === this.form.value.parameters.z;
  }

  checkDisableTable(item: any) {
    return this.form.value.type === 'map' && !this.analyticsConfig.mapParams[item];
  }
}
