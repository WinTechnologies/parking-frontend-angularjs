import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListviewNewComponent } from './listview-new.component';

describe('ListviewNewComponent', () => {
  let component: ListviewNewComponent;
  let fixture: ComponentFixture<ListviewNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListviewNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListviewNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
