import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueAddedListComponent } from './value-added-list.component';

describe('ValueAddedListComponent', () => {
  let component: ValueAddedListComponent;
  let fixture: ComponentFixture<ValueAddedListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueAddedListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueAddedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
