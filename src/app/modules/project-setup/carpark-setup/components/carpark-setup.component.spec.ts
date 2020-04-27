import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarparkSetupComponent } from './carpark-setup.component';

describe('CarparkSetupComponent', () => {
  let component: CarparkSetupComponent;
  let fixture: ComponentFixture<CarparkSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarparkSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarparkSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
