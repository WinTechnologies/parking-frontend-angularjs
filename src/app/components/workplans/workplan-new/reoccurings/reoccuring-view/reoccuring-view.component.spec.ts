import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ReoccuringViewComponent} from './reoccuring-view.component';

describe('ReoccuringViewComponent', () => {
  let component: ReoccuringViewComponent;
  let fixture: ComponentFixture<ReoccuringViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReoccuringViewComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReoccuringViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
