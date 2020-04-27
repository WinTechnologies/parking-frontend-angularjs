import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentiveDialogComponent } from './incentive-dialog.component';

describe('IncentiveDialogComponent', () => {
  let component: IncentiveDialogComponent;
  let fixture: ComponentFixture<IncentiveDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncentiveDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncentiveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
