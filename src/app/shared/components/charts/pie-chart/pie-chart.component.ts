import { Component, Input, OnInit } from '@angular/core';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { ChartComponent } from '../chart.component';
import { ChartOptions, PositionType } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./../chart.component.scss', './pie-chart.component.scss']
})
export class PieChartComponent extends ChartComponent implements OnInit {
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
      },
    },
    tooltips: {
      intersect: false,
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

  @Input() public legendPosition: PositionType = null;

  ngOnInit() {
    this.chartColors = this.getSingleChartColors();

    if (this.legendPosition) {
      this.chartOptions.legend.position = this.legendPosition;
    }
  }
}
