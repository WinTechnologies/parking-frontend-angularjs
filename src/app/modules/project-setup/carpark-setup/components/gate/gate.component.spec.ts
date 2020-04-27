import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnstreetProjectZoneComponent} from '../../../common-setup/components/onstreet/project-zone/onstreet-project-zone.component';

describe('ZoneComponent', () => {
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
