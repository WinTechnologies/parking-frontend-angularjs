import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ValueAddedScheduleComponent } from './value-added-schedule.component';

describe('ValueAddedScheduleComponent', () => {
  let component: ValueAddedScheduleComponent;
  let fixture: ComponentFixture<ValueAddedScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueAddedScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueAddedScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
