import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Exception } from '../models/exceptions.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-exception-view',
  templateUrl: './exception-view.component.html',
  styleUrls: ['./exception-view.component.scss']
})

export class ExceptionViewComponent implements OnInit, OnChanges {
  @Output() close = new EventEmitter<boolean>();
  @Input() exception: Exception = new Exception();
  @Input() canUpdate = true;
  @Input() disableName = false;

  dates: any[];
  start_time: any = '';
  end_time: any = '';
  color = 'red';
  slots: any[] = [];
  appliedDates: any[];

  constructor(
    private readonly datePipe: DatePipe
  ) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exception && this.exception.exception_name) {
      this.slots = [];
      this.appliedDates = [];
      if (this.exception.timeslot_working && this.exception.timeslot_working.length) {
        this.slots = this.exception.timeslot_working.split(',');
      }

      if (this.exception.applied_dates && this.exception.applied_dates.length) {
        const dates = this.exception.applied_dates.split(',');
        const appliedDates = [];
        dates.forEach(date => {
          appliedDates.push(new Date(date));
        });
        this.appliedDates = appliedDates;
      }
    }
  }

  public onAddTimeSlot() {
    if (!this.start_time) {
      this.start_time = '00:00';
    }
    if (!this.end_time) {
      this.end_time = '23:59';
    }
    const slots = this.slots.slice(0);
    slots.push(this.start_time + '-' + this.end_time);
    this.slots = slots;
    this.start_time = '';
    this.end_time = '';
    this.exception.timeslot_working = this.slots.join(',');
  }

  public onClearTimeSlot() {
    this.slots = [];
    this.exception.timeslot_working = '';
  }

  public changeAppliedDate(event) {
    const formattedDate = [];
    this.appliedDates.forEach(date => {
      formattedDate.push(this.datePipe.transform(date, 'yyyy-MM-dd'));
    });
    this.exception.applied_dates = formattedDate.join(',');
  }

  public onClose() {
    this.close.emit(true);
  }
}