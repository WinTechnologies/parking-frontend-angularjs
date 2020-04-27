import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExceptionNewComponent } from './exception-new.component';

describe('ExceptionViewComponent', () => {
  let component: ExceptionNewComponent;
  let fixture: ComponentFixture<ExceptionNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExceptionNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExceptionNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
