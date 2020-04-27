import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalationsListComponent } from './escalations-list.component';

describe('EscalationsListComponent', () => {
  let component: EscalationsListComponent;
  let fixture: ComponentFixture<EscalationsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EscalationsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscalationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
