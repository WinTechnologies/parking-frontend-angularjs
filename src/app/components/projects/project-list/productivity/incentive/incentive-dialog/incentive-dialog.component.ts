import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DialogData } from './models/dialog-data.model';
import { PgActEnforcementIncentiveService } from '../services/act-enforcement-incentive.service';
import { PgActEnforcementIncentive } from '../models/act-enforcement-incentive.model';
import { FormControl, Validators } from '@angular/forms';
import { PgActEnforcementIncentiveBandService } from './service/act-enforcement-incentive-band.service';
import { PgActEnforcementIncentiveBand } from './models/act-enforcement-incentive-band.model';
import { PgActEnforcementPredictionService } from '../../prediction/service/act-enforcement-prediction.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-incentive',
  templateUrl: './incentive-dialog.component.html',
  styleUrls: ['./incentive-dialog.component.scss']
})

export class IncentiveDialogComponent implements OnInit {
  functionality_label: string;
  // The list on the mat-select
  list_workplan: number[];
  list_incentive_type: string[];
  list_type: string[];
  list_incentives: string[];
  list_retrospective: string[];

  // The current field that the user select
  selected_name: FormControl;
  selected_work_plan: FormControl;
  selected_incentive_type: FormControl;
  selected_option: FormControl;
  selected_incentive_unity: FormControl;
  selected_calculation_type: FormControl;

  // Band fields
  band_value: FormControl;
  band_forecast: FormControl;
  band_rank: FormControl;

  // All the band associated to the current incentive
  incentives_band: PgActEnforcementIncentiveBand[] = [];

  // The incentive_band displayed on the html depending on the Percentage and the Value
  temp_incentives_band: PgActEnforcementIncentiveBand[] = [];

  // The issuance rate from the act_enforcement_prediction table
  issuance_rate: number;
  deleted_band_id: any[] = [];

  constructor(public dialogRef: MatDialogRef<IncentiveDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private pgActEnforcementIncentiveService: PgActEnforcementIncentiveService,
              private pgActEnforcementIncentiveBandServices: PgActEnforcementIncentiveBandService,
              private toastrService: ToastrService,
              private pgActEnforcementPredictionService: PgActEnforcementPredictionService
  ) { }

  ngOnInit() {
    this.initForm();
    // Retrieve the bands and the forecast only if the dialog has on update action
    if (this.functionality_label === 'Edit') {
      this.getIncentiveBand();
    }
    this.getIssuanceRate();
  }

/**
   * Init the fields on the dialog component
   */
  initForm() {
    this.list_workplan = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    this.list_incentive_type = ['Daily', 'Weekly', 'Monthly', 'Annually'];

    if (this.data.job_position === 'Tow Truck' || this.data.job_position ===  'Clamp Van' || this.data.job_position ===  'Driver') {
      this.list_type = ['Percentage', 'Quantity'];
      this.list_incentives = ['Value'];
    }
    else {
      this.list_type = ['Percentage'];
      this.list_incentives = ['Per CN', 'Value'];
    }

    this.list_retrospective = ['Retrospective', 'Cumulative'];

    this.functionality_label = this.data.functionality === 'add' ? 'Add New' : 'Edit';

    this.selected_name = new FormControl(this.data.incentive ? this.data.incentive.incentive_name : 'Incentive ', [Validators.required]);
    this.selected_work_plan = new FormControl(this.data.incentive ? this.data.incentive.workplan : 8, [Validators.required]);
    this.selected_incentive_type = new FormControl(this.data.incentive ? this.data.incentive.incentive_type : 'Monthly', [Validators.required]);
    this.selected_option =  new FormControl(this.data.incentive ? this.data.incentive.option : 'Percentage', [Validators.required]);
    this.selected_incentive_unity =  new FormControl(this.data.incentive ? this.data.incentive.incentive_unity : 'Value', [Validators.required]);
    this.selected_calculation_type =  new FormControl(this.data.incentive ? this.data.incentive.calculation_type : 'Retrospective', [Validators.required]);
  }

  /**
   * To retrieve all the incentive band from the database depending on the incentive id (only if the user update the incentive)
   */
  getIncentiveBand() {
    this.pgActEnforcementIncentiveBandServices.get(this.data.incentive.id).subscribe(result => {
      if (result) {
        this.incentives_band = result;
        this.incentives_band.sort((a: PgActEnforcementIncentiveBand, b: PgActEnforcementIncentiveBand) => a.rank - b.rank);
        this.onChangeFieldBand();
      }
    });
  }

  /**
   * To retrieve the Issuance Rate of the act_enforcement_prediction (to calculate the forecast (check onChangeIncentiveBands)
   */
  getIssuanceRate() {
    this.pgActEnforcementPredictionService.get(this.data.project.id).subscribe(result => {
      result.forEach(x => {
        if (x.job_position === this.data.job_position) {
          this.issuance_rate = x.issuance_rate;
        }
      });
    });

  }

  /**
   * Method executed on submit
   */
  confirm(): void {
    if (this.selected_name.value) {
      if (this.functionality_label === 'Add New') {
        const pg = new PgActEnforcementIncentive(
          this.data.project.id,
          this.data.job_position,
          this.data.incentive_category,
          this.selected_name.value,
          this.selected_work_plan.value,
          this.selected_incentive_type.value,
          this.selected_option.value,
          this.selected_incentive_unity.value,
          this.selected_calculation_type.value,
          this.data.manager_type);
          this.pgActEnforcementIncentiveService.create(pg).subscribe(res => {
            this.saveBand(res.id);
            this.toastrService.success('The incentive is created successfully', 'Success');
            this.dialogRef.close('ADD');
          }, err => {
            this.toastrService.error(err.error && err.error.message ? err.error.message : 'Something went wrong', 'Error');
            this.dialogRef.close(err.error.message);
          });
      } else {
        const id = this.data.incentive.id;
        const pg = new PgActEnforcementIncentive(
          this.data.project.id,
          this.data.job_position,
          this.data.incentive_category,
          this.selected_name.value,
          this.selected_work_plan.value,
          this.selected_incentive_type.value,
          this.selected_option.value,
          this.selected_incentive_unity.value,
          this.selected_calculation_type.value,
          this.data.manager_type,
          id);
        this.pgActEnforcementIncentiveService.update(pg).subscribe(res => {
          this.saveBand(id);
          this.toastrService.success('The incentive is updated successfully', 'Success');
          this.dialogRef.close('UPDATE');
        }, err => {
          this.toastrService.error(err.error && err.error.message ? err.error.message : 'Something went wrong', 'Error');
          this.dialogRef.close(err.error.message);
        });
      }
    }
    this.deleted_band_id.forEach(id => {
      this.pgActEnforcementIncentiveBandServices.delete(id).subscribe();
    });
  }

  saveBand(id: string) {
    this.temp_incentives_band.forEach(band => {
      const element = new PgActEnforcementIncentiveBand(
        band.band_id,
        band.calculate_type,
        band.rank,
        band.value_per_unity,
        band.value_on_currency,
        band.forecast_per_unity,
        band.forecast_on_currency,
        id,
        band.unity);
      if (band.band_id !== undefined) {
        // update band
        this.pgActEnforcementIncentiveBandServices.update(element).subscribe(res => {
        }, err => {
          this.dialogRef.close(err.error.message);
        });
      }
      if (band.band_id === undefined) {
        // create new band
        this.pgActEnforcementIncentiveBandServices.create(element).subscribe(res => {
        }, err => {
          this.dialogRef.close(err.error.message);
        });
      }
    });
  }

  onAddBand() {
    const band = {
      unity: this.selected_incentive_unity.value,
      calculate_type: this.selected_option.value,
      rank: 0,
      value_on_currency: 0,
      value_per_unity: 0,
      forecast_on_currency: 0,
      forecast_per_unity: 0
    };
    this.temp_incentives_band.push(band);
  }

  // Method executed when the user changes the mat-select value
  onChangeFieldBand() {
    // When Percentage, it's Value and when Quantity it's Per Job (for the tow truck and clamp van)
    if (this.data.job_position === 'Tow Truck' || this.data.job_position ===  'Clamp Van' || this.data.job_position ===  'Driver') {
      if (this.selected_option.value === 'Percentage') {
        this.list_incentives = ['Value'];
        this.selected_incentive_unity.setValue('Value');
      }
      else if (this.selected_option.value === 'Quantity') {
        this.list_incentives = ['Per Job'];
        this.selected_incentive_unity.setValue('Per Job');
      }
    }

    this.temp_incentives_band = [];
    if (this.incentives_band) {
      this.incentives_band.forEach( x => {
        if (x.calculate_type === this.selected_option.value && x.unity === this.selected_incentive_unity.value) {
          this.temp_incentives_band.push(x);
        }
      });
    }
  }

  /**
   * Method executed when the user changes the value of the table
   * @param i the position of the incentive_band that the user modified (on temp_icentive_band)
   * @param incentive_band_selected the incentive_band that the user modified
   */
  onChangeIncentiveBand(i, incentive_band_selected: PgActEnforcementIncentiveBand) {
    if (this.data.job_position === 'Tow Truck' || this.data.job_position ===  'Clamp Van' || this.data.job_position ===  'Driver') {
      if (incentive_band_selected.calculate_type === 'Percentage') {
        this.temp_incentives_band[i].forecast_on_currency = incentive_band_selected.value_on_currency;
      }
      else {
        if (this.selected_calculation_type.value === 'Retrospective') {
          this.temp_incentives_band[i].forecast_per_unity = incentive_band_selected.rank * incentive_band_selected.value_per_unity;

        } else if (this.selected_calculation_type.value === 'Cumulative') {
          this.temp_incentives_band[i].forecast_per_unity = incentive_band_selected.rank * incentive_band_selected.value_per_unity;
          // this.temp_incentives_band[i].forecast_per_unity = (15 * 2) + (incentive_band_selected.rank - 15) * incentive_band_selected.value_per_unity;
        }
      }
    }
    else {
      let forecast_var: number;
      switch (this.selected_incentive_type.value) {
        case 'Daily':
          forecast_var = 1;
          break;
        case 'Weekly':
          forecast_var = 6;
          break;
        case 'Monthly':
          forecast_var = 26;
          break;
        case 'Annually':
          forecast_var = 26 * 12;
          break;
        default:
          forecast_var = 1;
      }
      const f_init = ((this.selected_work_plan.value * 60) * forecast_var / this.issuance_rate);

      if (incentive_band_selected.calculate_type === 'Percentage') {
        if (incentive_band_selected.unity === 'Value') {
          this.temp_incentives_band[i].forecast_on_currency = incentive_band_selected.value_on_currency;
        }
        else {
          if (this.selected_calculation_type.value === 'Retrospective') {
            this.temp_incentives_band[i].forecast_per_unity = f_init * incentive_band_selected.rank / 100 * incentive_band_selected.value_per_unity;
          }
          else if (this.selected_calculation_type.value === 'Cumulative') {
            this.temp_incentives_band[i].forecast_per_unity = f_init * incentive_band_selected.rank / 100 * incentive_band_selected.value_per_unity ;
          }
        }
      }
    }

    // To remove from the temp_incentive_band if the user deletes all the column of the current incentive_band (forecast and percentage) in front
    if ( !incentive_band_selected.rank && !incentive_band_selected.value_per_unity && !incentive_band_selected.value_on_currency &&
    !incentive_band_selected.forecast_on_currency && !incentive_band_selected.forecast_per_unity) {
      this.deleted_band_id.push(this.temp_incentives_band[i].band_id);
      this.temp_incentives_band.splice(i, 1);
    }
  }

  onNoClick(): void {
    this.dialogRef.close('cancel');
  }
}