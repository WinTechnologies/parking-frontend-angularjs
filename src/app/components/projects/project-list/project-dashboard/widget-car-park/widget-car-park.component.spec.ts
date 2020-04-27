import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetCarParkComponent } from './widget-car-park.component';

describe('WidgetCarParkComponent', () => {
  let component: WidgetCarParkComponent;
  let fixture: ComponentFixture<WidgetCarParkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetCarParkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetCarParkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
