import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Workplan } from '../../../components/workplans/models/workplan.model';
import * as moment from 'moment';

@Component({
  selector: 'app-schedule-calendar',
  templateUrl: './schedule-calendar.component.html',
  styleUrls: ['./schedule-calendar.component.scss']
})
export class ScheduleCalendarComponent implements OnInit, OnChanges {
  @Input() workplan: Workplan;

  calendarOptions: any;
  displayEvent: any;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
  events: any[] = [];

  weekDaysAll = [
    {name: 'S', checked: false, key: 'sun'},
    {name: 'M', checked: false, key: 'mon'},
    {name: 'T', checked: false, key: 'tue'},
    {name: 'W', checked: false, key: 'wed'},
    {name: 'T', checked: false, key: 'thu'},
    {name: 'F', checked: false, key: 'fri'},
    {name: 'S', checked: false, key: 'sat'},
  ];

  constructor() { }

  ngOnInit() {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    const data = [];
    if (changes.workplan) {
      this.events = [];

      if (this.workplan && this.workplan.reoccurings.length) {
        this.workplan.reoccurings.forEach(reoccuring => {
          const timeslots = reoccuring.timeslot_working ? reoccuring.timeslot_working.split(',') : [];
          const dow = [];

          this.weekDaysAll.forEach((day, index) => {
            if (reoccuring.working_days.indexOf(day.key) >= 0) {
              dow.push(index);
            }
          });

          const start = moment(reoccuring.date_start, 'YYYY-MM-DD').startOf('day');

          let end;
          if (reoccuring.date_end) {
            end = moment(reoccuring.date_end, 'YYYY-MM-DD').endOf('day');
          } else {
            end = moment().add(3, 'months');
          }

          for (const day = start; day <= end; day.add(1, 'd')) {
            if (dow.findIndex(d => d === day.weekday()) >= 0) {
              timeslots.forEach(slot => {
                const times = slot.split('-');
                data.push({
                  title: reoccuring.reoccuring_name,
                  start: day.format('YYYY-MM-DD') + ' ' + times[0],
                  end: day.format('YYYY-MM-DD') + ' ' + times[1]
                });
              });
            }
          }
        });
      }

      if (this.workplan && this.workplan.exceptions.length) {
        this.workplan.exceptions.forEach(exception => {
          if (exception.applied_dates && exception.applied_dates.length
            && exception.timeslot_working && exception.timeslot_working.length) {
            const applied_dates = exception.applied_dates.split(',');
            const timeslots = exception.timeslot_working.split(',');

            applied_dates.forEach(date => {
              timeslots.forEach(slot => {
                const times = slot.split('-');
                data.push({
                  title: exception.exception_name,
                  start: date + ' ' + times[0],
                  end: date + ' ' + times[1],
                  color: 'red'
                });
              });
            });
          }
        });
      }

      this.events = data;
    }
  }

  private init() {
    this.calendarOptions = {
      editable: false,
      eventLimit: false,
      nowIndicator: true,                 // To display the real time
      defaultView : 'agendaThreeWeek',
      allDaySlot: false,                  // To hide the allday case
      businessHours : {                   // Days of Work (To exclude Friday
        dow: [ 0, 1, 2, 3, 4, 6 ],        // All Day except Friday (0=Sunday, 6= Saturday)
        start: '00:00',                   // a start time (10am in this example)
        end: '23:59'                      // an end time (6pm in this example)
      },
      header: {                           // The button displayed above the calendar
        right: 'prev,today,next',
        center: 'title',
        left: 'day,agendaThreeWeek,months,listThreeWeek'     // Add agendaWeek, agendaDay to display the other button
      },
      views: {
        day: {
          type: 'agenda',
          duration: { days: 1},
          buttonText: 'Day'
        },
        agendaThreeWeek: {
          columnFormat: 'ddd \n D',               // The Format of the date displayed on each columns
          scrollTime: '08:00:00',                 // To start the day's display at 8:00 am
          type: 'agenda',
          duration: { weeks: 3 },                 // The number of weeks displayed on the same time
          buttonText: 'Week'
        },
        months: {
          type: 'month',
          duration: { month: 1},
          buttonText: 'Month'
        },
        listThreeWeek: {                          // The events displayed on list are all the events for 1 month
          type: 'list',
          duration: { month: 1},
          buttonText: 'List'
        }
      },
      events: [],
    };
  }

  public eventRender(model: any) {
    ($(model.element)).attr('title', model.event.title);
    ($(model.element.find('.fc-content'))).css('display', 'none');
  }
}
