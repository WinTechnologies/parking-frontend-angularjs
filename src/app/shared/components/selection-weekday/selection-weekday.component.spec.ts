import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionWeekdayComponent } from './selection-weekday.component';

describe('SelectionWeekdayComponent', () => {
  let component: SelectionWeekdayComponent;
  let fixture: ComponentFixture<SelectionWeekdayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionWeekdayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionWeekdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
