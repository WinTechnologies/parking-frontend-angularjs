import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarparkProjectZoneComponent } from './carpark-project-zone.component';

describe('ZoneComponent', () => {
  let component: CarparkProjectZoneComponent;
  let fixture: ComponentFixture<CarparkProjectZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarparkProjectZoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarparkProjectZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
