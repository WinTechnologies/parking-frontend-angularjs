import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExceptionViewComponent} from './exception-view.component';

describe('ExceptionViewComponent', () => {
  let component: ExceptionViewComponent;
  let fixture: ComponentFixture<ExceptionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExceptionViewComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExceptionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
