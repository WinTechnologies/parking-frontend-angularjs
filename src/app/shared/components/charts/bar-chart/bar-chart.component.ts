import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { ChartComponent } from '../chart.component';
import { Color } from 'ng2-charts';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./../chart.component.scss', './bar-chart.component.scss']
})
export class BarChartComponent extends ChartComponent implements OnInit {
  @Input() horizontal = false;
  @Input() showLegendAsData = false;

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
      enabled: true,
      callbacks: {
        title(item: Chart.ChartTooltipItem[], data: Chart.ChartData): string | string[] {
          return data['datasets'][item[0].datasetIndex]['label'];
        },
      }
    },
    scales: {
      xAxes: [{
        ticks: {
          display: false,
        },
        gridLines: {
          display: false,
        },
      }],
      yAxes: [{
        ticks: {
          display: false,
        },
        gridLines: {
          display: false,
        },
      }],
    },
  };

  public chartType: ChartType = 'bar';
  public chartColors: Color[];

  @Input() public chartDataSets: ChartDataSets[] = [];

  ngOnInit() {
    this.chartColors = this.getMultiChartColors();

    if (this.horizontal) {
      this.chartType = 'horizontalBar';
      this.chartOptions.legend.position = 'bottom';
      this.chartOptions.scales.xAxes[0].ticks.display = true;
      this.chartOptions.scales.xAxes[0].gridLines.display = true;
      this.chartOptions.scales.yAxes[0].barThickness = 20;
      this.chartOptions.scales.yAxes[0].maxBarThickness = 20;
    } else {
      this.chartOptions.scales.yAxes[0].ticks.display = true;
      this.chartOptions.scales.yAxes[0].gridLines.display = true;
    }

    if (this.showLegendAsData) {
      this.chartOptions.legend.position = 'left';
      this.chartOptions.scales.xAxes[0].ticks.display = true;
      this.chartOptions.scales.xAxes[0].gridLines.display = true;
    }
  }
}
