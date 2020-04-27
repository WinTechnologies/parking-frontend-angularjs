import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import * as D3 from 'd3';

@Component({
  selector: 'app-widget-element-chart',
  templateUrl: './widget-element-chart.component.html',
  styleUrls: ['./widget-element-chart.component.css']
})

export class WidgetElementChartComponent {
  @ViewChild('containerPieChart') element: ElementRef;

  @Input() color;
  @Input() elemWidth;
  @Input() label;

  @Input() set pieData(data) {
    if (data) {
      this.rebuildChart(data);
    }
  }
  keys;
  values;
  private host: D3.Selection<any>;
  private svg: D3.Selection<any>;
  private width: number;
  private height: number;
  private radius: number;
  private htmlElement: HTMLElement;

  constructor() { }

  rebuildChart(data) {
    this.keys = Object.keys(data).filter(key => data[key] !== null && data[key] !== 0);
    this.values = Object.values(data).filter(element => element !== null && element !== 0);
    this.htmlElement = this.element.nativeElement;
    this.host = D3.select(this.htmlElement);
    this.setup();
    this.buildSVG();
    this.buildPie();
  }

  private setup(): void {
    this.width = 150;
    this.height = 150;
    this.radius = Math.min(this.width, this.height) / 2;
  }

  private buildSVG(): void {
    this.host.html('');
    this.svg = this.host.append('svg')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('width', `350px`)
      .attr('height', `240px`)
      .append('g')
      .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);
  }

  private buildPie(): void {
    const pie = D3.layout.pie();
    const arcSelection = this.svg.selectAll('.arc')
      .data(pie(this.values))
      .enter()
      .append('g')
      .attr('class', 'arc');
    this.populatePie(arcSelection);
  }

  private populatePie(arcSelection: D3.Selection<D3.layout.pie.Arc<any>>): void {
    const innerRadius = this.radius - 10;
    const outerRadius = this.radius - 20;
    const pieColor = D3.scale.category20c();
    const arc = D3.svg.arc<D3.layout.pie.Arc<any>>()
      .outerRadius(outerRadius);
    arcSelection.append('path')
      .attr('d', arc)
      .attr('fill', 'white')
      .attr('transform', 'scale(0.9)')
      .attr('stroke', this.color);

    arcSelection.append('text')
      .attr('transform', (datum: any) => {
        datum.innerRadius = 0;
        datum.outerRadius = outerRadius;
        return 'translate(' + arc.centroid(datum) + ')';
      })
      .attr('fill', '#023b41')
      .text((datum, index) => parseFloat(this.values[index]).toFixed(2))
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .append('tspan') // append % sign
      .attr('dominant-baseline', 'ideographic')
      .attr('fill', '#023b41')
      .text((datum, index) => '%')
      .style('font-size', '9.5px')
      .style('font-weight', 'bold');
    arcSelection.append('text')
      .attr('transform', (datum: any) => {
        datum.innerRadius = innerRadius + 15;
        datum.outerRadius = outerRadius + 35;
        return 'translate(' + arc.centroid(datum) + ')';
      })
      .text((datum, index) => this.values[index] ? this.keys[index] : '')
      .attr('fill', 'white')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-family', 'Roboto Condensed');
  }
}