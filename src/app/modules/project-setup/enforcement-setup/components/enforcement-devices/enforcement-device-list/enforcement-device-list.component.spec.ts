import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementDeviceListComponent } from './enforcement-device-list.component';

describe('EnforcementDeviceListComponent', () => {
  let component: EnforcementDeviceListComponent;
  let fixture: ComponentFixture<EnforcementDeviceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementDeviceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementDeviceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
