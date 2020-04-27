import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {WorkplanSelectPopupComponent} from './workplan-select-popup.component';

describe('WorkplanSelectPopupComponent', () => {
  let component: WorkplanSelectPopupComponent;
  let fixture: ComponentFixture<WorkplanSelectPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkplanSelectPopupComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplanSelectPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
