import { Component, Input, OnInit } from '@angular/core';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { ChartComponent } from '../chart.component';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./../chart.component.scss', './doughnut-chart.component.scss']
})
export class DoughnutChartComponent extends ChartComponent implements OnInit {
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 75,
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  @Input() public chartColors: Color[];

  @Input() public chartLabels: Label[] = [];

  @Input() public chartData: SingleDataSet = [];

  ngOnInit() {
    this.chartColors = this.getSingleChartColors();
  }
}
