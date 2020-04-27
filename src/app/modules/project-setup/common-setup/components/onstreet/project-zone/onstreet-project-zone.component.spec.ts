import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnstreetProjectZoneComponent } from './onstreet-project-zone.component';

describe('OnstreetProjectZoneComponent', () => {
  let component: OnstreetProjectZoneComponent;
  let fixture: ComponentFixture<OnstreetProjectZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnstreetProjectZoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnstreetProjectZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
