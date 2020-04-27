import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { weekdays } from 'moment';

@Component({
  selector: 'app-selection-weekday',
  templateUrl: './selection-weekday.component.html',
  styleUrls: ['./selection-weekday.component.scss']
})
export class SelectionWeekdayComponent implements OnInit, OnChanges {

  @Input() weekdays: string;
  @Input() canUpdate = true;
  @Input() weekdaynames: string[] = [];
  @Input() assignment = false;
  @Output() changedWeekdays= new EventEmitter<any>();

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
    if (this.weekdaynames.length) {
      this.weekDaysAll.forEach((v, i) => v.name = this.weekdaynames[i]);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.weekdays) {
      if (this.weekdays && this.weekdays.length) {
        this.weekDaysAll = this.weekDaysAll.map(wd => ({...wd, checked: this.weekdays.includes(wd.key)}));
      }
    }
  }

  public onSetDay(day: any) {
    if (!this.canUpdate) {
      return;
    }

    if(this.assignment && !this.weekdays.includes(day.key)) {
      return;
    }

    day.checked = !day.checked;

    const days = [];
    this.weekDaysAll.forEach(d => {
      if (d.checked ) {
          days.push(d.key);
      }
    });

    this.changedWeekdays.emit({weekdays: days.join(',')});
  }
}
