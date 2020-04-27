import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetElementChartComponent } from './widget-element-chart.component';

describe('WidgetElementChartComponent', () => {
  let component: WidgetElementChartComponent;
  let fixture: ComponentFixture<WidgetElementChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetElementChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetElementChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
