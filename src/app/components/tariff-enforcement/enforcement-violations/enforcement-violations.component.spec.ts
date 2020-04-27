import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementViolationsComponent } from './enforcement-violations.component';

describe('EnforcementViolationsComponent', () => {
  let component: EnforcementViolationsComponent;
  let fixture: ComponentFixture<EnforcementViolationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementViolationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementViolationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
