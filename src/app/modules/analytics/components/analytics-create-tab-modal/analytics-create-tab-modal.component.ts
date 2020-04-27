import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {AnalyticsService} from '../../services/analytics.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-analytics-create-tab-modal',
  templateUrl: './analytics-create-tab-modal.component.html',
  styleUrls: ['./analytics-create-tab-modal.component.scss']
})
export class AnalyticsCreateTabModalComponent implements OnInit {

  reportNameForm: FormGroup;
  projectId: number;

  constructor(
    private analyticsService: AnalyticsService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    public dialogRef: MatDialogRef<AnalyticsCreateTabModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData,
  ) { }

  ngOnInit() {
    this.reportNameForm = this.formBuilder.group({
      name: ['', [Validators.required, this.nameValidator.bind(this)]],
      project_id: this.dialogData.projectId
    });
    this.projectId = this.dialogData.projectId;
  }

  private nameValidator(control: AbstractControl) {
    const name = control.value;
    if (name && this.dialogData.reportList && this.dialogData.reportList.length) {
      if (this.dialogData.reportList.find(report => report.name.toLowerCase() === name.toLowerCase())) {
        return { duplicatedName: true };
      }
    }
    return null;
  }

  async onSubmit() {
    try {
      const result = await this.analyticsService.createDashboard({...this.reportNameForm.value});
      this.toastrService.success('The Report is created successfully', 'Success');
      this.dialogRef.close(true);
    } catch (e) {
      this.toastrService.error(e.error && e.error.message ? e.error.message : 'Something went wrong', 'Error');
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
