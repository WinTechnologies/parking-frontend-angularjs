import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementDeviceNewComponent } from './enforcement-device-new.component';

describe('EnforcementDeviceNewComponent', () => {
  let component: EnforcementDeviceNewComponent;
  let fixture: ComponentFixture<EnforcementDeviceNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementDeviceNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementDeviceNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
