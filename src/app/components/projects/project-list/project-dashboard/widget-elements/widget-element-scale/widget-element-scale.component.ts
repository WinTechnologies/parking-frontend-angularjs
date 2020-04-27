import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-widget-element-scale',
  templateUrl: './widget-element-scale.component.html',
  styleUrls: ['./widget-element-scale.component.css']
})

export class WidgetElementScaleComponent implements OnInit {
  @Input() value;
  @Input() elemWidth;
  @Input() color;
  @Input() label;
  @Input() scaleValue;
  deployedPercent;
  predictedPercent;

  constructor() { }

  ngOnInit() {
    this.deployedPercent = (!!this.scaleValue && +this.value.deployed > 0) ? Math.round((+this.scaleValue / +this.value.deployed) * 100) : '0';
    this.predictedPercent = (!!this.scaleValue && this.value.predicted > 0) ? Math.round((+this.scaleValue / +this.value.predicted) * 100) : '0';
  }
}