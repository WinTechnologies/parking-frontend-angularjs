import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedEmployeeNewComponent } from './assigned-employee-new.component';

describe('AssignedEmployeeNewComponent', () => {
  let component: AssignedEmployeeNewComponent;
  let fixture: ComponentFixture<AssignedEmployeeNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignedEmployeeNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignedEmployeeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
