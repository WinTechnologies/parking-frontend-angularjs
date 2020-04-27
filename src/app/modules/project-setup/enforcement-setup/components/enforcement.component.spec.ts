import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementComponent } from './enforcement.component';

describe('EnforcementComponent', () => {
  let component: EnforcementComponent;
  let fixture: ComponentFixture<EnforcementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
