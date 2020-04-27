import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeydateNewComponent } from './keydate-new.component';

describe('KeydateNewComponent', () => {
  let component: KeydateNewComponent;
  let fixture: ComponentFixture<KeydateNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeydateNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeydateNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
