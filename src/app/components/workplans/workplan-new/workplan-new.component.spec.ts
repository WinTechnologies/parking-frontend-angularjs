import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplanNewComponent } from './workplan-new.component';

describe('WorkplanNewComponent', () => {
  let component: WorkplanNewComponent;
  let fixture: ComponentFixture<WorkplanNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplanNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplanNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
