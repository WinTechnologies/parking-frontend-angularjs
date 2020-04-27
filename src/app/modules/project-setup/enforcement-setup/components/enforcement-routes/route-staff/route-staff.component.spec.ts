import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteStaffComponent } from './route-staff.component';

describe('RouteStaffComponent', () => {
  let component: RouteStaffComponent;
  let fixture: ComponentFixture<RouteStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
