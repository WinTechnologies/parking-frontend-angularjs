import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplanListComponent } from './workplan-list.component';

describe('WorkplanSelectPopupComponent', () => {
  let component: WorkplanListComponent;
  let fixture: ComponentFixture<WorkplanListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplanListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
