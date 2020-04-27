import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementEoListComponent } from './enforcement-eo-list.component';

describe('EnforcementEoListComponent', () => {
  let component: EnforcementEoListComponent;
  let fixture: ComponentFixture<EnforcementEoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementEoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementEoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
