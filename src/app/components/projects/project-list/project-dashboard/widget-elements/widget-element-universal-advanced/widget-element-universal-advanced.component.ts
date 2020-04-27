import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-widget-element-universal-advanced',
  templateUrl: './widget-element-universal-advanced.component.html',
  styleUrls: ['./widget-element-universal-advanced.component.css']
})
export class WidgetElementUniversalAdvancedComponent implements OnInit {
  @Input() elemWidth;
  @Input() elemHeight;
  @Input() label;
  @Input() icon;
  @Input() icon_right;
  @Input() color;
  @Input() value_current;
  @Input() value_total;

  @Input() label_value_current?;
  @Input() label_value_total?;

  constructor() { }

  ngOnInit() { }
}