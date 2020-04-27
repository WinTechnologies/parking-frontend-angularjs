import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenLandComponent } from './open-land.component';

describe('OpenLandComponent', () => {
  let component: OpenLandComponent;
  let fixture: ComponentFixture<OpenLandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenLandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenLandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
