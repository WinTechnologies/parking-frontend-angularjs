import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentViolationDetailsComponent } from './assignment-violation-details.component';

describe('AssignmentViolationDetailsComponent', () => {
  let component: AssignmentViolationDetailsComponent;
  let fixture: ComponentFixture<AssignmentViolationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentViolationDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentViolationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
