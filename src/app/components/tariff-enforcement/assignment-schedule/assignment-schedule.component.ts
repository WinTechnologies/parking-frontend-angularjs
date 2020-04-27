import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-assignment-schedule',
  templateUrl: './assignment-schedule.component.html',
  styleUrls: ['./assignment-schedule.component.scss']
})

export class AssignmentScheduleComponent implements OnInit {
  @Input() date_start;
  @Input() date_end;

  @Input() selectDays;
  @Input() working_timeslot;

  working_days;
  constructor() { }

  ngOnInit() {
    this.working_timeslot = this.working_timeslot ? this.working_timeslot.split(',') : [];
    const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const working_days = this.selectDays ? this.selectDays.split(',') : [];
    this.working_days = weekDays.map(day => {
      if (working_days.includes(day)) {
        return { name: day, isSelected: true };
      } else {
        return { name: day, isSelected: false };
      }
    });
  }
}