import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Reoccuring } from '../models/reoccurings.model';

@Component({
  selector: 'app-reoccuring-new',
  templateUrl: './reoccuring-new.component.html',
  styleUrls: ['./reoccuring-new.component.scss']
})

export class ReoccuringNewComponent implements OnInit, OnChanges {
  @Output() close = new EventEmitter<boolean>();

  @Input() reoccuring: Reoccuring = new Reoccuring();
  @Input() canUpdate = true;

  slots: any[] = [];
  start_time: any = '';
  end_time: any = '';
  color = '#2196f3';

  constructor(
  ) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.reoccuring && this.reoccuring.reoccuring_name) {
      this.slots = [];
      if (this.reoccuring.timeslot_working && this.reoccuring.timeslot_working.length) {
        const timeslots = this.reoccuring.timeslot_working.split(',');
        this.slots = timeslots;
      }
    }
  }

  public onChangedWeekdays(event: any) {
    this.reoccuring.working_days = event.weekdays;
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
    this.reoccuring.timeslot_working = this.slots.join(',');
  }

  public onClearTimeSlot() {
    this.slots = [];
    this.reoccuring.timeslot_working = '';
  }

  public onApply() {

  }

  public onClose() {
    this.close.emit(true);
  }
}