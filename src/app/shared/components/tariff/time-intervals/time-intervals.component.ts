import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-time-intervals',
  templateUrl: './time-intervals.component.html',
  styleUrls: ['./time-intervals.component.css']
})
export class TimeIntervalsComponent implements OnChanges {
  @Input() interval = 5;
  @Input() range = [];
  @Input() currency = '€';
  @Input() timeType = 'day';
  @Input() timesInput: Array<Object> = [];
  @Output() timesOutput = new EventEmitter();

  timesArray: Array<Object> = [];
  selectPoints = [];
  newTime = {
    startPoint: null,
    endPoint: null,
    amount: null
  };
  showSelect = true;
  addingError = false;

  static convertToTime(value) {
    let time = '';
    if (value < 60) {
      time = value < 10 ? '00:0' + value : '00:' + value;
    } else {
      const hours = Math.trunc(value / 60);
      const minutes = value % 60;
      if (hours < 10) {
        time = minutes < 10 ? '0' + hours + ':0' + minutes : '0' + hours + ':' + minutes;
      } else {
        time = minutes < 10 ? hours + ':0' + minutes : hours + ':' + minutes;
      }
    }
    return time;
  }

  constructor() {}

  ngOnChanges(changes) {
    if (changes.interval || changes.range || changes.timeType) {
      this.timesArray = [];
      this.timesOutput.emit({segments: this.timesArray, completed: false});
      this.refreshSelectPoints();
    }
    if (changes.timesInput) {
      this.addExistingPoints();
      this.refreshSelectPoints();
    }
  }

  refreshSelectPoints() {
    this.selectPoints = [];
    if (this.timeType === 'day') {
      const availablePoints = [];
      let segment = [];
      for (let i = 0; i < this.range.length; i++) {
        const hour = parseInt(this.range[i].split(':')[0], 10);
        for (let minutes = 0; minutes < 60; minutes++) {
          segment.push(hour * 60 + minutes);
        }
        if ((i + 1 < this.range.length && parseInt(this.range[i + 1].split(':')[0], 10) - hour !== 1) || i + 1 === this.range.length) {
          segment.push((hour + 1) * 60);
          availablePoints.push(segment);
          segment = [];
        }
      }
      for (let i = 0; i < availablePoints.length; i++) {
        for (let j = 0; j < availablePoints[i].length; j++) {
          if (j % this.interval === 0) {
            this.selectPoints.push({
              value: availablePoints[i][j],
              text: TimeIntervalsComponent.convertToTime(availablePoints[i][j]),
              show: true,
              disabled: false,
              disabledStart: j === availablePoints[i].length - 1,
              disabledEnd: j === 0
            });
          }
        }
      }
    }
    if (this.timeType === 'spent') {
      const globalTime = this.range.length * 60;
      for (let i = 0; i <= globalTime; i++) {
        if (i % this.interval === 0) {
          this.selectPoints.push({
            value: i,
            text: TimeIntervalsComponent.convertToTime(i),
            show: true,
            disabled: false,
            disabledStart: i === globalTime,
            disabledEnd: i === 0
          });
        }
      }
    }
    this.refreshDisabledPoints();
  }

  refreshDisabledPoints() {
    let showSelect = false;
    for (let i = 0; i < this.selectPoints.length; i++) {
      this.selectPoints[i].disabled = false;
      this.selectPoints[i].disabledStart = i === this.selectPoints.length - 1;
      this.selectPoints[i].disabledEnd = i === 0;
      this.selectPoints[i].show = true;
      if (this.timeType === 'day' && i + 1 < this.selectPoints.length) {
        if (i + 1 < this.selectPoints.length && this.selectPoints[i + 1].value - this.selectPoints[i].value !== this.interval) {
          this.selectPoints[i].disabledStart = true;
        }
        if (i - 1 > 0 && this.selectPoints[i].value - this.selectPoints[i - 1].value !== this.interval) {
          this.selectPoints[i].disabledEnd = true;
        }
      }
      for (let j = 0; j < this.timesArray.length; j++) {
        if (this.selectPoints[i].value === this.timesArray[j]['start'].value) {
          this.selectPoints[i].disabledStart = true;
        }
        if (this.selectPoints[i].value === this.timesArray[j]['end'].value) {
          this.selectPoints[i].disabledEnd = true;
        }
        if (this.selectPoints[i].value > this.timesArray[j]['start'].value && this.selectPoints[i].value < this.timesArray[j]['end'].value) {
          this.selectPoints[i].disabled = true;
        }
      }
      if (this.selectPoints[i].disabled || (this.selectPoints[i].disabledStart && this.selectPoints[i].disabledEnd)) {
        this.selectPoints[i].show = false;
      } else {
        showSelect = true;
      }
    }
    this.showSelect = showSelect;
  }

  addExistingPoints() {
    if (this.timesInput && this.timesInput.length) {
      this.timesInput = this.timesInput.sort((a, b) => a['number'] - b['number']);
      this.timesInput.forEach( (time) => {
        const start = time['start'].split(':');
        const end = time['end'].split(':');
        this.newTime = {
          startPoint: {
            text: start[0] + ':' + start[1],
            value: parseInt(start[0], 10) * 60 + parseInt(start[1], 10)
          },
          endPoint: {
            text: end[0] + ':' + end[1],
            value: parseInt(end[0], 10) * 60 + parseInt(end[1], 10)
          },
          amount: time['value']
        };
        this.addTime();
      });
    }
  }

  selectPoint() {
    this.refreshDisabledPoints();
    if (this.newTime.startPoint) {
      for (let i = 0; i < this.selectPoints.length; i++) {
        if (this.selectPoints[i].value <= this.newTime.startPoint['value']) {
          this.selectPoints[i].disabledEnd = true;
        } else if (this.selectPoints[i].disabledEnd && i + 1 < this.selectPoints.length) {
          this.selectPoints[i + 1].disabledEnd = true;
        }
      }
    }
    if (this.newTime.endPoint) {
      for (let i = this.selectPoints.length - 1; i >= 0; i--) {
        if (this.selectPoints[i].value >= this.newTime.endPoint['value']) {
          this.selectPoints[i].disabledStart = true;
        } else if (this.selectPoints[i].disabledStart && i - 1 >= 0) {
          this.selectPoints[i - 1].disabledStart = true;
        }
      }
    }
  }

  addTime() {
    if (this.newTime.startPoint !== null && this.newTime.endPoint !== null && this.newTime.amount !== null) {
      this.timesArray.push({
        start: {value: this.newTime.startPoint.value, text: this.newTime.startPoint.text},
        end: {value: this.newTime.endPoint.value, text: this.newTime.endPoint.text},
        amount: this.newTime.amount
      });
      this.clearTime();
      this.timesOutput.emit({segments: this.timesArray, completed: !this.showSelect});
    } else {
      this.addingError = true;
      window.setTimeout(() => {
        this.addingError = false;
      }, 2000);
    }
  }

  deleteTime(time) {
    this.timesArray.splice(this.timesArray.indexOf(time), 1);
    this.clearTime();
    this.timesOutput.emit({segments: this.timesArray, completed: !this.showSelect});
  }

  clearTime() {
    this.refreshDisabledPoints();
    this.newTime = {
      startPoint: null,
      endPoint: null,
      amount: null
    };
  }
}
