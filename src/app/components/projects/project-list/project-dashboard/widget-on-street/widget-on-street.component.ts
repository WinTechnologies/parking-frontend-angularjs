import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-widget-on-street',
  templateUrl: './widget-on-street.component.html',
  styleUrls: ['./widget-on-street.component.css']
})

export class WidgetOnStreetComponent implements OnInit {
  @Input() data;
  @Input() options;

  constructor() { }

  ngOnInit() { }
}