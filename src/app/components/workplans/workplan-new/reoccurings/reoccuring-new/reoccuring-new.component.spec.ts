import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReoccuringNewComponent } from './reoccuring-new.component';

describe('ReoccuringViewComponent', () => {
  let component: ReoccuringNewComponent;
  let fixture: ComponentFixture<ReoccuringNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReoccuringNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReoccuringNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
