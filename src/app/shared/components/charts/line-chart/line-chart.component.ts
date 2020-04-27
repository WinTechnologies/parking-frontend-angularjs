import { Component, Input, OnInit } from '@angular/core';
import { Color, Label } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { ChartComponent } from '../chart.component';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./../chart.component.scss', './line-chart.component.scss']
})
export class LineChartComponent extends ChartComponent implements OnInit {
  @Input() filled = false;
  @Input() xAxeTitle: string = null;
  @Input() yAxeTitle: string = null;

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        type: 'linear',
        scaleLabel: {
          display: false,
          labelString: null,
        },
        gridLines: {
          drawOnChartArea: false,
          drawBorder: true,
          offsetGridLines: true,
        },
      }],
      yAxes: [{
        type: 'linear',
        scaleLabel: {
          display: false,
          labelString: null,
        },
        gridLines: {
          drawOnChartArea: false,
          drawBorder: true,
          offsetGridLines: true,
        },
      }],
    },
  };

  @Input() public chartColors: Color[];

  @Input() public chartLabels: Label[] = [];

  @Input() public chartDataSets: ChartDataSets[] = [];

  ngOnInit() {
    this.chartColors = this.getMultiChartColors(this.filled);

    if (this.xAxeTitle) {
      this.chartOptions.scales.xAxes[0].scaleLabel.display = true;
      this.chartOptions.scales.xAxes[0].scaleLabel.labelString = this.xAxeTitle;
    }

    if (this.yAxeTitle) {
      this.chartOptions.scales.yAxes[0].scaleLabel.display = true;
      this.chartOptions.scales.yAxes[0].scaleLabel.labelString = this.yAxeTitle;
    }
  }
}
