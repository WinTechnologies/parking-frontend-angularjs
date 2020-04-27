import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupService } from '../../../../services/group.service';
import { MatDialog } from '@angular/material';
import { PopupViolationsComponent } from '../popup-violations/popup-violations.component';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../../../services/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.scss']
})

export class GroupDetailsComponent implements OnInit {
  @Input() groupId: number;
  @Input() projectId: number;
  @Input() permission: any;
  @Input() isCreate: any;
  @Output() updateStatus = new EventEmitter();
  assignmentId = -1;
  form: FormGroup;
  group;
  slots: any[] = [];
  singleViolationValue;

  formInProcess = false;
  formSubmitted = false;
  today = new Date();
  dateStart: string;
  dateEnd: string;
  changeFlag = false;

  constructor(
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    private dialog: MatDialog,
    private toastrService: ToastrService,
    private loaderService: LoaderService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.today.setHours(0, 0, 0, 0);
    try {
      this.loaderService.enable();
      if (this.groupId) {
        const groups = await this.groupService.getGroupById(this.groupId).toPromise();
        this.group = groups[0];
      }
      this.initForm();
    } finally {
      this.loaderService.disable();
    }
  }

  initForm() {
    this.form = this.formBuilder.group({
      group_name: [this.group ? this.group.group_name : null, Validators.required],
      date_start: [this.group ? this.group.date_start : new Date(), Validators.required],
      date_end: [this.group ? this.group.date_end : null, Validators.required],
      time_from: [],
      time_to: [],
      working_days: [this.group ? this.group.working_days : null, Validators.required],
    });

    this.form.get('date_start').disable();
    this.slots = (this.group && this.group.working_timeslot ) ? this.group.working_timeslot.split(',') : [];
  }

  updateFlag() {
    if (this.group) {
      this.changeFlag = !(this.group.group_name === this.form.value.group_name && this.group.date_end === this.form.value.date_end && this.group.working_days === this.form.value.working_days && !this.form.value.time_from && !this.form.value.time_to);
    } else {
      this.changeFlag = !(!this.form.value.group_name && !this.form.value.date_end && !this.form.value.time_from && !this.form.value.time_to && !this.form.value.working_days);
    }
  }

  public onCancel() {
    const groupId = this.groupId ? this.groupId : 0;
    this.updateGroupStatus(groupId);
  }

  async onSubmit() {
    try {
      this.formSubmitted = true;
      if (!this.form.valid || this.formInProcess ) {
        this.toastrService.error('Please fill in the required fields!', 'Error!');
        return;
      } else if (this.slots.length === 0)  {
        this.toastrService.error('You should add the time range.', 'Error!');
        return;
      }
      this.loaderService.enable();
      this.formInProcess = true;
      let focusGroup;
      const requestData = this.getValueForRequest();
      if (this.isCreate) {
        await this.groupService.addGroup(requestData).toPromise();
        this.toastrService.success('The group is created successfully!', 'Success!');
        focusGroup = 0;
      } else {
        requestData.date_start = this.group.date_start;
        await this.groupService.updateGroup(requestData, this.group.id).toPromise();
        this.toastrService.success('The group is updated successfully!', 'Success!');
        focusGroup = this.group.id;
      }
      this.updateGroupStatus(focusGroup);
    } catch (e) {
      this.toastrService.error(e.message ? e.message : 'Something went wrong', 'Error');
    } finally {
      this.loaderService.disable();
      this.formInProcess = false;
    }
  }

  private updateGroupStatus (focusGroup: any) {
    this.updateStatus.emit({
      isCreate: false,
      groupId: null,
      focusGroup: focusGroup
    });
  }

  /**
   * formation of the object for the request
   */
  getValueForRequest() {
    const formData = this.form.value;
    return {
      group_name: formData.group_name,
      date_start: moment(formData.date_start).format('YYYY-MM-DD'),
      date_end: !formData.date_end ? null : moment(formData.date_end).format('YYYY-MM-DD'),
      working_days: formData.working_days,
      working_timeslot: (this.slots.length !== 0) ? this.slots.join(',') : '00:00-23:59',
      project_id: this.projectId
    };
  }

  onAddAssignment() {
    const dialogRef = this.dialog.open(PopupViolationsComponent, {
      width: '88%',
      data: { project_id: this.projectId, groupId: this.groupId }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.singleViolationValue = result;
    });
  }

  closeAssignment(event) {
    this.singleViolationValue = null;
    this.assignmentId = event.assignmentId;
  }

  selectingViolation(violation) {
    this.singleViolationValue = violation;
  }

  onChangedWeekdays(event: any) {
    this.form.patchValue({working_days: event.weekdays });
    this.form.updateValueAndValidity();
  }

  public onAddTimeSlot() {
    if (this.form.get('time_from').value && this.form.get('time_to').value) {
      const slots = this.slots.slice(0);
      slots.push(this.form.get('time_from').value + '-' + this.form.get('time_to').value);
      this.slots = slots;
      this.form.get('time_from').setValue('');
      this.form.get('time_to').setValue('');
    } else  {
      this.toastrService.error('Please change your time period', 'Error');
    }
  }

  public onClearTimeSlot() {
    this.form.get('time_from').setValue('');
    this.form.get('time_to').setValue('');
    this.slots = [];
  }
}