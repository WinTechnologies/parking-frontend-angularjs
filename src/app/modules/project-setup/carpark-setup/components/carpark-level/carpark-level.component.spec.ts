import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarparkLevelComponent } from './carpark-level.component';

describe('ZoneComponent', () => {
  let component: CarparkLevelComponent;
  let fixture: ComponentFixture<CarparkLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarparkLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarparkLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
