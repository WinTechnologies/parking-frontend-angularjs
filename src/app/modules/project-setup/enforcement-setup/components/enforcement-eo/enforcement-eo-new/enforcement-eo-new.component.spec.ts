import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementEoNewComponent } from './enforcement-eo-new.component';

describe('EnforcementEoNewComponent', () => {
  let component: EnforcementEoNewComponent;
  let fixture: ComponentFixture<EnforcementEoNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementEoNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementEoNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
