import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectZoneComponent } from '../../../common-setup/components/onstreet/project-zone/onstreet-project-zone.component';

describe('ZoneComponent', () => {
  let component: ProjectZoneComponent;
  let fixture: ComponentFixture<ProjectZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectZoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
