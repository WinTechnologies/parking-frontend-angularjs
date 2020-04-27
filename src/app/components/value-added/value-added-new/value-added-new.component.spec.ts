import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueAddedNewComponent } from './value-added-new.component';

describe('ValueAddedNewComponent', () => {
  let component: ValueAddedNewComponent;
  let fixture: ComponentFixture<ValueAddedNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueAddedNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueAddedNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
