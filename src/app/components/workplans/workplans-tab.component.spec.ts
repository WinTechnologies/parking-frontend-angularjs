import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplansTabComponent } from './workplans-tab.component';

describe('WorkplansTabComponent', () => {
  let component: WorkplansTabComponent;
  let fixture: ComponentFixture<WorkplansTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplansTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplansTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
