import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as moment from 'moment';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-promotion-validity',
  templateUrl: './promotion-validity.component.html',
  styleUrls: ['./promotion-validity.component.scss']
})
export class PromotionValidityComponent implements OnInit, OnChanges {

  @Input() promotion: any;
  @Input() formGroup: FormGroup;
  @Input() canUpdate = false;

  date_start = '';
  date_end = '';
  start_time: any = '';
  end_time: any = '';
  color = '#2196f3';
  slots: any[] = [];

  constructor(
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.promotion) {
      this.slots = [];
      if (this.promotion.timeslot) {
        this.slots = this.promotion.timeslot.split(',');
      }
    }
  }

  public onAddTimeSlot() {
    if (this.start_time && this.end_time) {
      this.slots = [...this.slots, `${this.start_time}-${this.end_time}`];
      this.start_time = '';
      this.end_time = '';
      this.promotion.timeslot = this.slots.join(',');
    }
  }

  public onClearTimeSlot() {
    this.slots = [];
    this.promotion.timeslot_working = '';
  }

  public onChangedWeekdays(event: any) {
    if (this.canUpdate) {
      this.promotion.working_days = event.weekdays;
    }
  }
}
