import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-widget-car-park',
  templateUrl: './widget-car-park.component.html',
  styleUrls: ['./widget-car-park.component.css']
})

export class WidgetCarParkComponent implements OnInit {
  /** widget data **/
  @Input() data;
  @Input() options;

  constructor() { }

  ngOnInit() { }
}