import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupViolationsComponent } from './popup-violations.component';

describe('PopupViolationsComponent', () => {
  let component: PopupViolationsComponent;
  let fixture: ComponentFixture<PopupViolationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupViolationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupViolationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
