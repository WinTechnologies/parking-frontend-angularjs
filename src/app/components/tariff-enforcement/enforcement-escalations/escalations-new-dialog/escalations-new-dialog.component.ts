import { Component, Inject, OnInit } from '@angular/core';
import { Escalation } from '../models/escalation.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PgEscalationService } from '../services/escalation.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../../../services/loader.service';

enum OutstandingStatus {
  Tow = 'tow',
  Clamp = 'clamp'
}

type OutstandingType = 'violation' | 'days';

enum LogicalRuleStatus {
  And = 'And',
  Or = 'Or'
}

@Component({
  selector: 'app-escalations-new-dialog',
  templateUrl: './escalations-new-dialog.component.html',
  styleUrls: ['./escalations-new-dialog.component.scss']
})

export class EscalationsNewDialogComponent implements OnInit {
  form: FormGroup;
  formSubmitted = false;
  formInProcess = false;

  projectId: number;
  escalation: Escalation;
  selectedZones: any[] = [];

  OutstandingStatus = OutstandingStatus;
  outstanding = {
    violation: null,
    days: null
  };

  logicalRule = null;
  LogicalRuleStatus = LogicalRuleStatus;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly escalationService: PgEscalationService,
    private readonly toastr: ToastrService,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EscalationsNewDialogComponent>,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.getData();
    this.buildForm();
  }

  private getData() {
    this.projectId = this.data.projectId;
    this.escalation = this.data.escalation || new Escalation();

    if (this.escalation.id) {
      this.selectedZones = this.escalation.zones ? this.escalation.zones : [];
      this.outstanding.violation = this.escalation.outstanding_violation_clamp ? 'clamp' : this.escalation.outstanding_violation_tow ? 'tow' : null;
      this.outstanding.days = this.escalation.outstanding_days_clamp ? 'clamp' : this.escalation.outstanding_days_tow ? 'tow' : null;
      this.logicalRule = this.escalation.logical_rule ? this.escalation.logical_rule : null;
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      escalation_name: [this.escalation.id ? this.escalation.escalation_name : '', [Validators.required]],
      outstanding_violation_nbr: [this.escalation.id ? this.escalation.outstanding_violation_nbr : null, [Validators.required, Validators.min(1)]],
      outstanding_days_nbr: [this.escalation.id ? this.escalation.outstanding_days_nbr : null, [Validators.required, Validators.min(1)]],
      fee_tow: [this.escalation.id ? this.escalation.fee_tow : null, [Validators.required, Validators.min(1)]],
      fee_clamp: [this.escalation.id ? this.escalation.fee_clamp : null, [Validators.required, Validators.min(1)]],
      storage_fee: [this.escalation.id ? this.escalation.storage_fee : null, [Validators.required, Validators.min(1)]],
      storage_fee_unit: [this.escalation.id ? this.escalation.storage_fee_unit : 'Day', [Validators.required]],
      storage_max: [this.escalation.id ? this.escalation.storage_max : null, [Validators.required, Validators.min(1)]],
      storage_max_unit: [this.escalation.id ? this.escalation.storage_max_unit : 'Monthly', [Validators.required]],
      applied_immediately: [this.escalation.id ? this.escalation.applied_immediately : true, [Validators.required]],
      applied_after: [this.escalation.id ? this.escalation.applied_after : null, [Validators.required, Validators.min(1)]],
      applied_after_unit: [this.escalation.id ? this.escalation.applied_after_unit : 'Hours', [Validators.required]],
      zones: [this.escalation.id  ? this.escalation.zones : null, Validators.required]
    });

    this.updateStatusNbr('days');
    this.updateStatusNbr('violation');
    this.updateFees();
    this.updateStatusForAppliedAfter();
  }

  public async onSubmit() {
    this.formSubmitted = true;

    if (!this.checkValidation() || this.formInProcess) {
      return;
    }
    this.loaderService.enable();
    this.formInProcess = true;

    try {
      const escalation = this.form.getRawValue() as Escalation;
      escalation.project_id = this.projectId;

      escalation.outstanding_violation_tow = this.outstanding.violation ?  this.outstanding.violation === OutstandingStatus.Tow : null;
      escalation.outstanding_violation_clamp = this.outstanding.violation ?  this.outstanding.violation === OutstandingStatus.Clamp : null;
      escalation.outstanding_days_tow = this.outstanding.days ?  this.outstanding.days === OutstandingStatus.Tow : null;
      escalation.outstanding_days_clamp = this.outstanding.days ?  this.outstanding.days === OutstandingStatus.Clamp : null;
      escalation.logical_rule = this.logicalRule;

      if (escalation.applied_immediately) {
        escalation.applied_after = 0;
      }

      if (this.escalation.id) {
        escalation.id = this.escalation.id;
        await this.escalationService.update(escalation).toPromise();
        this.toastr.success('The Escalation is updated successfully!', 'Success!');
        this.dialogRef.close('updated');
      } else {
        await this.escalationService.create(escalation).toPromise();
        this.dialogRef.close('created');
        this.toastr.success('New Escalation is created successfully!', 'Success!');
      }
    } finally {
      this.loaderService.disable();
      this.formInProcess = false;
    }
  }

  onSelectZones(event) {
    this.selectedZones = event;
    this.form.patchValue({zones: event });
    this.form.updateValueAndValidity();
  }

  public onCancel() {
    this.dialogRef.close('close');
  }

  private updateFees() {
    if (this.outstanding.violation === 'tow' || this.outstanding.days === 'tow') {
      if (!this.form.get('fee_tow')) {
        this.form.addControl('fee_tow', new FormControl(this.escalation.id ? this.escalation.fee_tow : null, [Validators.required, Validators.min(1)]));
      }
      if (!this.form.get('storage_fee')) {
        this.form.addControl('storage_fee', new FormControl(this.escalation.id ? this.escalation.storage_fee : null, [Validators.required, Validators.min(1)]));
      }

      if (!this.form.get('storage_max')) {
        this.form.addControl('storage_max', new FormControl(this.escalation.id ? this.escalation.storage_max : null, [Validators.required, Validators.min(1)]));
      }
    } else {
      this.form.removeControl('fee_tow');
      this.form.removeControl('storage_fee');
      this.form.removeControl('storage_max');
    }

    if (this.outstanding.violation === 'clamp' || this.outstanding.days === 'tow') {
      if (!this.form.get('fee_clamp')) {
        this.form.addControl('fee_clamp', new FormControl(this.escalation.id ? this.escalation.fee_clamp : null, [Validators.required, Validators.min(1)]));
      }
    } else {
      this.form.removeControl('fee_clamp');
    }
  }

  public onClickOutstanding(type: string, status: OutstandingStatus) {
    if (this.outstanding[type] === status) {
      this.outstanding[type] = null;
    } else {
      this.outstanding[type] = status;
    }
    this.updateFees();
    this.updateStatusNbr(type);
  }

  private updateStatusNbr(type: string) {
    const controlName = type === 'days' ? 'outstanding_days_nbr' : 'outstanding_violation_nbr';
    if (!this.outstanding[type]) {
      this.form.get(controlName).setValue(null);
      this.form.get(controlName).disable();
      if (this.logicalRule) {
        this.logicalRule = null;
      }
    } else {
      this.form.get(controlName).enable();
    }
  }

  public onClickLogical(status: LogicalRuleStatus) {
    if (this.outstanding.violation && this.outstanding.days) {
      if (this.logicalRule === status ) {
        this.logicalRule = null;
      } else {
        this.logicalRule = status;
      }
    }
  }

  private updateStatusForAppliedAfter() {
    const checked = this.form.get('applied_immediately').value;
    if (checked) {
      this.form.get('applied_after').disable();
      this.form.get('applied_after_unit').disable();
    } else {
      this.form.get('applied_after').enable();
      this.form.get('applied_after_unit').enable();
    }
  }

  public onChangeAppliedImmediately(event: any) {
    this.updateStatusForAppliedAfter();
  }

  checkValidation() {
    return this.form.valid && (this.outstanding.days || this.outstanding.violation);
  }
}