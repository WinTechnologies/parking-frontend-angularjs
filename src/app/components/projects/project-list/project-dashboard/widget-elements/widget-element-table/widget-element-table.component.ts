import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-widget-element-table',
  templateUrl: './widget-element-table.component.html',
  styleUrls: ['./widget-element-table.component.css']
})

export class WidgetElementTableComponent implements OnInit {
  @Input() color;
  @Input() elemWidth;
  dataTable = [{
    name: 'Escalated',
    off: 1000,
    sar: 230
  },
  {
    name: 'CAPTURED',
    percent: 50,
    off: 500,
    sar: 115
  },
  {
    name: 'MISSED',
    percent: 40,
    off: 400,
    sar: 92
  },
  {
    name: 'CANCELED',
    percent: 10,
    off: 100,
    sar: 10
  }];

  constructor() { }

  ngOnInit() { }
}