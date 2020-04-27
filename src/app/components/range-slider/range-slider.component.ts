import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.css']
})

export class RangeSliderComponent implements OnChanges {
  @Input() interval = 5;
  @Output() times = new EventEmitter();

  hours = [];
  lastSelect = {
    isInitial: true,
    lastValue: 0
  };
  selectedHours = [];
  points = [];
  activePoints = [];

  constructor() {
    this.refreshData();
  }

  ngOnChanges(changes) {
    this.refreshData();
  }

  refreshData() {
    this.hours = [];
    for (let i = 0; i <= 24; i++) {
      let label = '';
      if (i < 10) {
        label = '0' + i + ' 00';
      } else {
        label = i + ' 00';
      }
      this.hours.push({label, value: i, selected: false});
    }

    let start = moment().startOf('day').unix();
    let end = moment().endOf('day').unix();
    let i = 0;
    this.points = [];
    this.activePoints = [];
    while (moment(start * 1000).add(i * this.interval, 'minutes').unix() <= end) {
      this.points.push(moment(start * 1000).add(i * this.interval, 'minutes').unix());
      i += 1;
    }

    this.times.emit(this.activePoints);
  }

  clickHour(hour) {
    if (this.lastSelect.isInitial) {
      this.lastSelect.isInitial = false;
      this.lastSelect.lastValue = hour.value;
    } else {
      this.lastSelect.isInitial = true;
      if (this.lastSelect.lastValue < hour.value) {
        this.selectHours(this.lastSelect.lastValue, hour.value);
      } else {
        this.selectHours(hour.value, this.lastSelect.lastValue);
      }
    }
  }

  selectHours(from, to) {
    for (let i = from; i <= to; i++) {
      this.hours[i].selected = !this.hours[i].selected;
      this.hours[i].active = (i < to) ? !this.hours[i].active : this.hours[i].active;
    }
    this.getSelectedHours();
    this.setActivePoints(from, to);
  }

  getSelectedHours() {
    this.selectedHours = [];
    for (let i = 0; i < this.hours.length; i++) {
      if (this.hours[i].selected) {
        this.selectedHours.push(this.hours[i]);
      }
    }
  }

  setActivePoints(from, to) {
    let start_day = moment().startOf('day').unix();
    let start_time =  moment(start_day * 1000).add(from, 'hours').unix();
    let end_time =  moment(start_day * 1000).add(to, 'hours').unix();

    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i] >= start_time && this.points[i] <= end_time) {
        if (this.activePoints.indexOf(this.points[i]) !== -1) {
          if (this.points[i] === start_time) {
            if(from === 0 || !this.hours[from - 1].selected) {
              this.activePoints.splice (this.activePoints.indexOf(this.points[i]),1);
            }
          } else if (this.points[i] === end_time) {
            if(to === 24 || !this.hours[to + 1].selected) {
              this.activePoints.splice (this.activePoints.indexOf(this.points[i]),1);
            }
          } else {
            this.activePoints.splice (this.activePoints.indexOf(this.points[i]),1);
          }
        } else {
          this.activePoints.push(this.points[i]);
        }
      }
    }
    this.times.emit(this.activePoints);
  }
}