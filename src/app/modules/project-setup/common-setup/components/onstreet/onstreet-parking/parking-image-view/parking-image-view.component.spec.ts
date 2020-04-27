import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingImageViewComponent } from './parking-image-view.component';

describe('ParkingImageViewComponent', () => {
  let component: ParkingImageViewComponent;
  let fixture: ComponentFixture<ParkingImageViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParkingImageViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkingImageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
