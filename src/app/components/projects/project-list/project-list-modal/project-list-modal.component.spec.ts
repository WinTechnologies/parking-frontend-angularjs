import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListModalComponent } from './project-list-modal.component';

describe('ProjectListModalComponent', () => {
  let component: ProjectListModalComponent;
  let fixture: ComponentFixture<ProjectListModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectListModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
