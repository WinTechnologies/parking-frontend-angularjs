import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Reoccuring } from '../models/reoccurings.model';

@Component({
  selector: 'app-reoccuring-view',
  templateUrl: './reoccuring-view.component.html',
  styleUrls: ['./reoccuring-view.component.scss']
})

export class ReoccuringViewComponent implements OnInit, OnChanges {
  @Input() reoccuring: Reoccuring = new Reoccuring();
  @Input() canUpdate = true;
  @Input() disableName = false;
  slots: any[] = [];
  start_time: any = '';
  end_time: any = '';
  color = '#2196f3';

  constructor() { }

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

  public onApply() {  }
}