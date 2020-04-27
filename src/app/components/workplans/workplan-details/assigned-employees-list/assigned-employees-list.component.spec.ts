import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedEmployeesListComponent } from './assigned-employees-list.component';

describe('AssignedEmployeesListComponent', () => {
  let component: AssignedEmployeesListComponent;
  let fixture: ComponentFixture<AssignedEmployeesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignedEmployeesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignedEmployeesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
