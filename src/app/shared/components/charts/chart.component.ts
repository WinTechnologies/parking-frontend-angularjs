import { Input } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Color } from 'ng2-charts';

export class ChartComponent {
  @Input() title: string;

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  private palette = [
    '#CEC8E4',
    '#F9F7E8',
    '#F6C9BC',
    '#F2AFA3',
    '#4F3961',
    '#EA728C',
    '#FC9D9D',
    '#F3D4D4',
    '#D7385E',
    '#522D5B',
    '#E7D39F',
  ];

  private transparent = 'rgba(0, 0, 0, 0)';
  private white = '#ffffff';

  public getMultiChartColors(filled: boolean = true): Color[] {
    return this.palette.map(color => ({
      backgroundColor: filled ? color : this.transparent,
      borderColor: color,
      pointBackgroundColor: filled ? color : this.transparent,
      pointBorderColor: this.white,
      pointHoverBackgroundColor: filled ? this.white : this.transparent,
      pointHoverBorderColor: this.white,
    }));
  }

  public getSingleChartColors(filled: boolean = true): Color[] {
    const transparent = this.palette.map(color => this.transparent);

    return [{
      backgroundColor: filled ? this.palette : transparent,
      borderColor: this.palette,
      pointBackgroundColor: filled ? this.palette : transparent,
      pointBorderColor: this.white,
      pointHoverBackgroundColor: filled ? this.white : this.transparent,
      pointHoverBorderColor: this.white,
    }];
  }
}
