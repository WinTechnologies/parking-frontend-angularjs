import { Component, Input, OnInit } from '@angular/core';
import { analyticsConfig } from '../../config/analytics.config';
import { config } from '../../../../../config';

@Component({
  selector: 'app-analytics-chart',
  templateUrl: './analytics-chart.component.html',
  styleUrls: ['./analytics-chart.component.scss']
})

export class AnalyticsChartComponent implements OnInit {
  @Input() settings;
  @Input() dataSets;

  chart;
  contraventionStatus = config.contraventionStatus;

  constructor() { }

  ngOnInit() {
    this.initChart();
  }

  private initChart() {
    const chart: any = {};
    chart.type = this.settings.type;
    chart.options = analyticsConfig.baseChartOptions[chart.type];
    chart.legend = true;

    if (this.dataSets.length) {
      if (chart.type !== 'map') {
        let subLabels = [];
        const computation =  this.settings.extra_params.computation;
        let yLabel = `${this.settings.extra_params.aggregation}(${this.settings.parameters.y})`;
        yLabel += computation === 'percentage' ? ' - %' : '';
        chart.options.scales = {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: yLabel
            }
          }]
        };

        switch (chart.type) {
          case 'pie':
            chart.data = this.applyComputation(this.dataSets.map((item) => +item.y), computation);
            chart.labels = this.dataSets.map((item) => item.x);
            break;
          case 'bar':
          case 'line':
            chart.options.scales = {
              ...chart.options.scales,
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: this.settings.parameters.x
                }
              }]
            };
            chart.labels = this.arrayDistinct(this.dataSets, 'x');
            if (this.settings.parameters.z) {
              chart.data = [];
              subLabels = this.arrayDistinct(this.dataSets, 'z');
              subLabels.forEach((z) => {
                const dataItem = {data: [], label: z};
                chart.labels.forEach((x) => {
                  const value = this.dataSets.find(item => item.x === x && item.z === z);
                  dataItem.data.push(value ? value.y : 0);
                });
                dataItem.data = this.applyComputation(dataItem.data, computation);
                chart.data.push(dataItem);
              });
            } else {
              chart.data = [{
                data: this.applyComputation(this.dataSets.map(item => +item.y), computation),
                label: ''
              }];
            }
            break;
          default:
            break;
        }
      } else {
        chart.data = [...this.dataSets];
      }
    }

    this.chart = {...chart};
  }

  private arrayDistinct(array, field) {
    const mappedArray = array.map((item) => item[field]);
    return mappedArray.filter((item, index) => mappedArray.indexOf(item) === index);
  }

  private applyComputation(chartData, computation) {
    const sum = computation === 'percentage' ? chartData.reduce((s, item) => s + (+item), 0) : 100;
    return chartData.map(item => (item * 100 / sum).toFixed(2));
  }
}