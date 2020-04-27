import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetElementUniversalComponent } from './widget-element-universal.component';

describe('WidgetElementUniversalComponent', () => {
  let component: WidgetElementUniversalComponent;
  let fixture: ComponentFixture<WidgetElementUniversalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetElementUniversalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetElementUniversalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
