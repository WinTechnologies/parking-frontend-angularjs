import * as moment from 'moment';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from '../../../../services/group.service';
import { LoaderService } from '../../../../services/loader.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-assignment-details',
  templateUrl: './assignment-details.component.html',
  styleUrls: ['./assignment-details.component.scss']
})

export class AssignmentDetailsComponent implements OnInit {
  @Input() violation;
  @Input() projectId;
  @Input() groupId;
  @Output() closeAssignment = new EventEmitter();

  assignmentForm: FormGroup;
  assignment;
  selectedZones: string[];
  slots: string[] = [];
  tow_checked = false;
  clamp_checked = false;

  formInProcess = false;
  formSubmitted = false;
  today = new Date();
  group;
  dateStart: Date;
  dateEnd: Date;
  workingDays: string[];
  timeStart: string;
  timeEnd: string;

  constructor(
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    private loaderService: LoaderService,
    private toastrService: ToastrService,
  ) { }

  async ngOnInit() {
    this.today.setHours(0, 0, 0, 0);

    try {
      this.loaderService.enable();
      if (this.violation.assignment_id) {
        this.assignment = await this.groupService.getAssignmentById(this.violation.assignment_id).toPromise();
        this.selectedZones = !this.assignment.zones ? [] : this.assignment.zones;
      } else {
        this.selectedZones = [];
      }
      if (this.groupId) {
        const groups = await this.groupService.getGroupById(this.groupId).toPromise();
        this.group = groups[0];

        this.dateStart = new Date(this.group.date_start);
        this.dateEnd = new Date(this.group.date_end);
      }

      this.initForm();
    } finally {
      this.loaderService.disable();
    }
  }

  private initForm() {
    this.assignmentForm = this.formBuilder.group({
      value: [this.assignment ? this.assignment.value : null, Validators.required],
      late_fee_value: [this.assignment ? this.assignment.late_fee_value : null],
      late_fee_days: [this.assignment ? this.assignment.late_fee_days : null],
      discount_value: [this.assignment ? this.assignment.discount_value : null],
      discount_days: [this.assignment ? this.assignment.discount_days : null],
      observation_min: [this.assignment ? this.assignment.observation_min : null],
      action_tow: [this.assignment ? this.assignment.action_tow : false],
      action_clamp: [this.assignment ? this.assignment.action_clamp : false],
      date_start: [this.assignment ? this.assignment.date_start : new Date(), Validators.required],
      date_end: [this.assignment ? this.assignment.date_end : null, Validators.required],
      time_from: [],
      time_to: [],
      service_fee: [this.assignment ? this.assignment.service_fee : 0, Validators.required],
      working_days: [this.assignment ? this.assignment.working_days : null, Validators.required],
      zones: [this.assignment ? this.assignment.zones : null, Validators.required]
    });

    this.workingDays = this.assignmentForm.get('working_days').value;

    this.slots = (this.assignment && this.assignment.working_timeslot ) ? this.assignment.working_timeslot.split(',') : [];
    this.setTimeRange(this.slots);
    this.tow_checked = this.assignmentForm.get('action_tow').value;
    this.clamp_checked = this.assignmentForm.get('action_clamp').value;
  }

  public setTimeRange(slots) {
    const timeList = [];
    slots.forEach( slot => {
      const timeLine = slot.split('-');
      timeLine.forEach(res => {
        timeList.push(res);
      });
    });

    this.timeStart = timeList[0];
    this.timeEnd = timeList[timeList.length - 1];
  }

  async onSubmit() {
    try {
      this.formSubmitted = true;
      if (!this.assignmentForm.valid || this.formInProcess ) {
        this.toastrService.error('Please fill in the required fields!', 'Error!');
        return;
      }

      this.formInProcess = true;
      let assignmentId = 0;
      const requestData = this.getValueForRequest();
      if (!this.assignment) {
        await this.groupService.createAssigment(requestData).toPromise();
        this.toastrService.success('The violation is assigned successfully!', 'Success');

      } else {
        await this.groupService.updateAssignmentById(requestData, this.violation.assignment_id).toPromise();
        this.toastrService.success('The violation is updated successfully!', 'Success');
        assignmentId = this.violation.assignment_id;
      }

      this.closeAssignment.emit({
        assignmentId: assignmentId
      });

    } catch (e) {
      this.toastrService.error(e.message ? e.message : 'Something went wrong', 'Error');
    } finally {
      this.loaderService.disable();
      this.formInProcess = false;
    }
  }

  getValueForRequest() {
    const formValue = this.assignmentForm.value;
    const assignment = {
      ...formValue,
      date_start: moment(formValue.date_start).format('YYYY-MM-DD'),
      date_end: !formValue.date_end ? null : moment(formValue.date_end).format('YYYY-MM-DD'),
      group_id: this.groupId,
      violation_id: this.violation.id,
      working_timeslot: (this.slots.length !== 0) ? this.slots.join(',') : '00:00-23:59'
    };
    delete assignment.time_from;
    delete assignment.time_to;
    return assignment;
  }

  onCancel() {
    this.closeAssignment.emit({
      violationId: this.violation.id
    });
  }

  onChangedWeekdays(event: any) {
    this.assignmentForm.patchValue({working_days: event.weekdays });
    this.assignmentForm.updateValueAndValidity();
  }

  onSelectZones(event) {
    this.selectedZones = event;
    this.assignmentForm.patchValue({zones: event });
    this.assignmentForm.updateValueAndValidity();
  }

  onAddTimeSlot() {
    const format = 'hh:mm';
    const tf = moment(this.assignmentForm.get('time_from').value, format);
    const tt = moment(this.assignmentForm.get('time_to').value, format);

    const time_from = moment({ hour: tf.hour() - 1, minute: 59 });
    const time_to = moment({ hour: tt.hour(), minute: 1 });


    if ( this.slots.length > 0)  {
      this.slots.forEach( slot => {
        const timeLine = slot.split('-');
        const beforeTime = moment(timeLine[0], format);
        const afterTime = moment(timeLine[1], format);

        if (time_from.isBetween(beforeTime, afterTime) && time_to.isBetween(beforeTime, afterTime)) {
          const slots = this.slots.slice(0);
          slots.push(this.assignmentForm.get('time_from').value + '-' + this.assignmentForm.get('time_to').value);
          this.slots = slots;
          this.assignmentForm.get('time_from').setValue('');
          this.assignmentForm.get('time_to').setValue('');
        } else {
          this.toastrService.error('The period you selected is outside the period defined in Groups. Please change your time period', 'Error');
        }
      });
    } else {
      const beforeTime = moment(time_from, format);
      const afterTime = moment(time_to, format);

        if (tf.isBetween(beforeTime, afterTime) && tt.isBetween(beforeTime, afterTime) ) {
          const slots = this.slots.slice(0);
          slots.push(this.assignmentForm.get('time_from').value + '-' + this.assignmentForm.get('time_to').value);
          this.slots = slots;
          this.assignmentForm.get('time_from').setValue('');
          this.assignmentForm.get('time_to').setValue('');
        } else {
          this.toastrService.error('The period you selected is outside the period defined in Groups. Please change your time period', 'Error');
        }
    }
  }

  onClearTimeSlot() {
    this.slots = [];
  }

  changeTowAction() {
    this.tow_checked = !this.tow_checked;
    if (this.tow_checked && this.clamp_checked) {
      this.clamp_checked = false;
    }
    this.assignmentForm.get('action_tow').setValue(this.tow_checked);
    this.assignmentForm.get('action_clamp').setValue(this.clamp_checked);
  }

  changeClampAction() {
    this.clamp_checked = !this.clamp_checked;
    if (this.clamp_checked && this.tow_checked) {
      this.tow_checked = false;
    }
    this.assignmentForm.get('action_clamp').setValue(this.clamp_checked);
    this.assignmentForm.get('action_tow').setValue(this.tow_checked);
  }

  preventNegative(event) {
    return event.charCode >= 48 && event.charCode <= 57;
  }
}