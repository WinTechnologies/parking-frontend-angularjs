import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as moment from 'moment';

class TimeSlot {
  start: number;
  end: number;
  label: string;
}

@Component({
  selector: 'app-timeline-view',
  templateUrl: './timeline-view.component.html',
  styleUrls: ['./timeline-view.component.scss']
})
export class TimelineViewComponent implements OnInit, OnChanges {

  @Input() timeslots: any[] = [];
  @Input() color = 'red';
  @Input() timeFormat = '12'; // to show 12 hours format or 24 hours format. Default: 12 hours

  slots: TimeSlot[] = [];
  hours: string[] = [];

  originHours = {
    '12': [
      '12:00 AM',
      '01:00 AM',
      '02:00 AM',
      '03:00 AM',
      '04:00 AM',
      '05:00 AM',
      '06:00 AM',
      '07:00 AM',
      '08:00 AM',
      '09:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '01:00 PM',
      '02:00 PM',
      '03:00 PM',
      '04:00 PM',
      '05:00 PM',
      '06:00 PM',
      '07:00 PM',
      '08:00 PM',
      '09:00 PM',
      '10:00 PM',
      '11:00 PM',
    ],
    '24': [
      '00:00',
      '01:00',
      '02:00',
      '03:00',
      '04:00',
      '05:00',
      '06:00',
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00',
      '24:00',
    ]
  };

  constructor() { }

  ngOnInit() {
    this.buildTimeSlots();
  }

  ngOnChanges() {
    this.buildTimeSlots();
  }

  private buildTimeSlots() {
    if (this.timeslots.length) {
      const slots = [];
      let min_hour = 999999;
      let max_hour = 0;

      this.timeslots.forEach(t => {
        const times = t.split('-');
        let time = moment(times[0], 'HH:mm');
        const start = time.hours() * 60 + time.minutes();
        time = moment(times[1], 'HH:mm');
        let end = time.hours() * 60 + time.minutes();
        if (end < start) {
          end += 24 * 60;
        }

        if (min_hour > start) {
          min_hour = start;
        }

        if (max_hour < end) {
          max_hour = end;
        }

        slots.push({
          start: start,
          end: end,
          label: this.makeLabel(t)
        });
      });

      const hours = [];

      for (let i = Math.floor(min_hour / 60); i < Math.floor(max_hour / 60) + 1; i++) {
        let label = '';
        let hour = i;
        if (this.timeFormat === '24') {
          if (hour > 24) {
            hour = hour - 24;
          }
          label = hour + ':00';
        } else {
          if (hour >= 24) {
            hour = hour - 24;
          }
          if (hour === 0) {
            label = '12:00 AM';
          } else if (hour < 12) {
            if (hour < 10) {
              label = '0' + hour + ':00 AM';
            } else {
              label = hour + ':00 AM';
            }
          } else if (hour === 12) {
            label = '12:00 PM';
          } else if (hour < 24) {
            hour = hour - 12;
            if (hour < 10) {
              label = '0' + hour + ':00 PM';
            } else {
              label = hour + ':00 PM';
            }
          }
        }
        hours.push(label);
      }

      slots.forEach(slot => {
        slot.start = slot.start - Math.floor(min_hour / 60) * 60;
        slot.end = slot.end - Math.floor(min_hour / 60) * 60;
      });

      this.hours = hours;
      this.slots = slots;
    } else {
      this.slots = [];
      this.hours = [...this.originHours[this.timeFormat]];
    }
  }

  public calculateStyles(slot: TimeSlot) {
    return {
      'width': 60 * (slot.end - slot.start) / 60 + 'px',
      'left': 60 * slot.start / 60 + 'px',
      'background-color': this.color,
      'position': 'absolute',
      'text-align': 'center'
    };
  }

  private makeLabel(label): string {
    const times = label.split('-');
    if (this.timeFormat === '12') {
      return `${moment(times[0], 'HH:mm').format('hh:mm A')}-${moment(times[1], 'HH:mm').format('hh:mm A')}`;
    } else {
      return `${times[0]}-${times[1]}`;
    }
  }
}
