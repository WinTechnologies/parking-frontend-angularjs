import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveListComponent } from './incentive-list.component';

describe('IncentiveListComponent', () => {
  let component: IncentiveListComponent;
  let fixture: ComponentFixture<IncentiveListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncentiveListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncentiveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
