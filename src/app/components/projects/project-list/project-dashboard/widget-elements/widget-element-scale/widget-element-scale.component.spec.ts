import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetElementScaleComponent } from './widget-element-scale.component';

describe('WidgetElementScaleComponent', () => {
  let component: WidgetElementScaleComponent;
  let fixture: ComponentFixture<WidgetElementScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetElementScaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetElementScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
