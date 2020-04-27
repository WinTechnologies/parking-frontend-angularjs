import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnStreetComponent } from './on-street.component';

describe('OnStreetComponent', () => {
  let component: OnStreetComponent;
  let fixture: ComponentFixture<OnStreetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnStreetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnStreetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
