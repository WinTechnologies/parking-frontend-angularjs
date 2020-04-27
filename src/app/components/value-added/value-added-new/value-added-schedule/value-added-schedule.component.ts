import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ValueAddedSchedule } from '../../models/value-added.model';
import { AmazingTimePickerService } from 'amazing-time-picker';

@Component({
  selector: 'app-value-added-schedule',
  templateUrl: './value-added-schedule.component.html',
  styleUrls: ['./value-added-schedule.component.scss']
})

export class ValueAddedScheduleComponent implements OnInit, OnChanges {
  @Input() schedule: ValueAddedSchedule = new ValueAddedSchedule();
  @Input() canUpdate = false;

  dates: any[];
  start_time: any = '';
  end_time: any = '';
  color = '#2196f3';
  slots: any[] = [];
  appliedDates: any[];

  constructor(
    private readonly datePipe: DatePipe,
    private atp: AmazingTimePickerService

  ) { }

  open() {
    const amazingTimePicker = this.atp.open();
    amazingTimePicker.afterClose().subscribe(time => {

    });
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.schedule && this.schedule) {
      this.slots = [];
      if (this.schedule.timeslot_working && this.schedule.timeslot_working.length) {
        let timeslots = this.schedule.timeslot_working.split(',');
        this.slots = timeslots;
      }
    }
  }

  public onAddTimeSlot() {
    if (this.start_time && this.end_time) {
      let slots = this.slots.slice(0);
      slots.push(this.start_time + '-' + this.end_time);
      this.slots = slots;
      this.start_time = '';
      this.end_time = '';
      this.schedule.timeslot_working = this.slots.join(',');
    }
  }

  public onClearTimeSlot() {
    this.slots = [];
    this.schedule.timeslot_working = '';
  }

  public onChangedWeekdays(event: any) {
    if (this.canUpdate) {
      this.schedule.working_days = event.weekdays;
    }
  }
}