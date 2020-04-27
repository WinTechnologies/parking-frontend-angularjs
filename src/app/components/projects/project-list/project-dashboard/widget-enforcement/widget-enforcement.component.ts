import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-widget-enforcement',
  templateUrl: './widget-enforcement.component.html',
  styleUrls: ['./widget-enforcement.component.css']
})

export class WidgetEnforcementComponent implements OnInit {
  /** widget data **/
  @Input() data;
  @Input() options;

  constructor() { }

  ngOnInit() { }
}
