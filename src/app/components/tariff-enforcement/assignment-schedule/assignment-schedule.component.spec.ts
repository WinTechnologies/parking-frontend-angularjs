import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentScheduleComponent } from './assignment-schedule.component';

describe('AssignmentScheduleComponent', () => {
  let component: AssignmentScheduleComponent;
  let fixture: ComponentFixture<AssignmentScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
