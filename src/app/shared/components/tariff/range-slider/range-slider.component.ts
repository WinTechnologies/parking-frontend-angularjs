import {Component, EventEmitter, Input, OnInit, Output, OnChanges} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.css']
})
export class RangeSliderComponent implements OnChanges {
  @Input() productTimes = [];
  @Output() times = new EventEmitter();
  hours = [];
  lastSelect = {
    isInitial: true,
    lastValue: 0
  };

  constructor() {
    this.refreshData();
  }

  ngOnChanges(changes) {
    if (!changes.productTimes.firstChange) {
      this.refreshData();
    }
  }

  refreshData() {
    this.hours = [];
    for (let i = 0; i <= 24; i++) {
      const label = (i < 10 ? '0' + i : i) + ':00';
      this.hours.push({label: label, value: i, selected: false, active: false});
      if (this.productTimes && this.productTimes.length && this.productTimes.indexOf(this.hours[i].label) !== -1) {
        this.hours[i].active = true;
      }
    }
    this.setHours();
  }

  clickHour(hour) {
    if (this.lastSelect.isInitial) {
      this.lastSelect.isInitial = false;
      this.lastSelect.lastValue = hour.value;
    } else {
      this.lastSelect.isInitial = true;
      if (this.lastSelect.lastValue !== hour.value) {
        if (this.lastSelect.lastValue < hour.value) {
          this.selectHours(this.lastSelect.lastValue, hour.value);
        } else {
          this.selectHours(hour.value, this.lastSelect.lastValue);
        }
      }
    }
  }

  selectHours(from, to) {
    for (let i = from; i <= to; i++) {
      this.hours[i].selected = !this.hours[i].selected;
      this.hours[i].active = (i < to) ? !this.hours[i].active : this.hours[i].active;
    }
    this.setHours();
  }

  setHours() {
    const hoursArray = [];
    for (let h = 0; h < this.hours.length; h++) {
      if (this.hours[h].active) {
        hoursArray.push({val: this.hours[h].value, text: this.hours[h].label});
      }
    }
    this.times.emit(hoursArray);
  }
}
