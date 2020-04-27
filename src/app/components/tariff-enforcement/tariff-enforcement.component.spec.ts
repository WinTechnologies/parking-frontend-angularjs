import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TariffEnforcementComponent } from './tariff-enforcement.component';

describe('TariffEnforcementComponent', () => {
  let component: TariffEnforcementComponent;
  let fixture: ComponentFixture<TariffEnforcementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TariffEnforcementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TariffEnforcementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
