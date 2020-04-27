import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeydateListComponent } from './keydate-list.component';

describe('KeydateListComponent', () => {
  let component: KeydateListComponent;
  let fixture: ComponentFixture<KeydateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeydateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeydateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
