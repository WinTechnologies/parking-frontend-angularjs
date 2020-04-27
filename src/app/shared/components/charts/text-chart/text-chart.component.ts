import { Component, OnInit } from '@angular/core';
import { ChartComponent } from '../chart.component';

@Component({
  selector: 'app-text-chart',
  templateUrl: './text-chart.component.html',
  styleUrls: ['./../chart.component.scss', './text-chart.component.scss']
})
export class TextChartComponent extends ChartComponent implements OnInit {
  ngOnInit() {
  }
}
