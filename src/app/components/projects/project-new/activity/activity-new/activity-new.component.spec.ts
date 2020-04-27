import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityNewComponent } from './activity-new.component';

describe('ActivityNewComponent', () => {
  let component: ActivityNewComponent;
  let fixture: ComponentFixture<ActivityNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
