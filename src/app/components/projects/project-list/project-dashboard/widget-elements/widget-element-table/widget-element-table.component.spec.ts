import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetElementTableComponent } from './widget-element-table.component';

describe('WidgetElementTableComponent', () => {
  let component: WidgetElementTableComponent;
  let fixture: ComponentFixture<WidgetElementTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetElementTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetElementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
