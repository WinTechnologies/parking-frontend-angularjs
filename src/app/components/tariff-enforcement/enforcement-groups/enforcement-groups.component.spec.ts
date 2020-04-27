import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementGroupsComponent } from './enforcement-groups.component';

describe('EnforcementGroupsComponent', () => {
  let component: EnforcementGroupsComponent;
  let fixture: ComponentFixture<EnforcementGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
