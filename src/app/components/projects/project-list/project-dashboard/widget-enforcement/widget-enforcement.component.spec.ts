import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetEnforcementComponent } from './widget-enforcement.component';

describe('WidgetEnforcementComponent', () => {
  let component: WidgetEnforcementComponent;
  let fixture: ComponentFixture<WidgetEnforcementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetEnforcementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetEnforcementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
