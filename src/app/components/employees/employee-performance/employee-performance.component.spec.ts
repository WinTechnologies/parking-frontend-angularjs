import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePerformanceComponent } from './employee-performance.component';

describe('EmployeeProductivityComponent', () => {
  let component: EmployeePerformanceComponent;
  let fixture: ComponentFixture<EmployeePerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeePerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeePerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
