import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-widget-element-universal',
  templateUrl: './widget-element-universal.component.html',
  styleUrls: ['./widget-element-universal.component.css']
})

export class WidgetElementUniversalComponent implements OnInit {
  @Input() elemWidth;
  @Input() elemHeight;
  @Input() label;
  @Input() icon;
  @Input() color;
  @Input() value;
  @Input() image;
  @Input() units_of_measurement;
  @Input() isNumber: boolean;

  constructor() { }

  ngOnInit() { }

  defineClass(elementTypeName: string): any {
    switch (elementTypeName) {
      case 'd-flex':
        return { 'h-100': !this.label && !this.image };
      case 'value':
        return {
          'value-1000': this.icon === 'money_icon.svg' && this.value.length >= 9,
          'value-100': this.icon === 'money_icon.svg' && this.value.length >= 6 && !this.label.startsWith('R'),
          'value': this.icon === 'money_icon.svg' || this.value.length
        };
      default:
        return;
    }
  }

  defineStyle(elementValueName: string): any {
    switch (elementValueName) {
      case 'element':
        return { 'background-color': this.color, 'width': this.elemWidth, 'height': this.elemHeight ? this.elemHeight : '100px' };
      case 'icon':
        return { 'height': this.value ? '30px' : '60px' };
      default:
        return;
    }
  }
}