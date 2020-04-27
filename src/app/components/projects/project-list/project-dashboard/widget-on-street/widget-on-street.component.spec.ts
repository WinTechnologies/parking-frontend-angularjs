import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetOnStreetComponent } from './widget-on-street.component';

describe('WidgetOnStreetComponent', () => {
  let component: WidgetOnStreetComponent;
  let fixture: ComponentFixture<WidgetOnStreetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetOnStreetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetOnStreetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
