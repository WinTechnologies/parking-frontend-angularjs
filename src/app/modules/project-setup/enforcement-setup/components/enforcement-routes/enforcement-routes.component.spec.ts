import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementRoutesComponent } from './enforcement-routes.component';

describe('EnforcementRoutesComponent', () => {
  let component: EnforcementRoutesComponent;
  let fixture: ComponentFixture<EnforcementRoutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementRoutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
