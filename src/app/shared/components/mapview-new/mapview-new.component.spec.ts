import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapviewNewComponent } from './mapview-new.component';

describe('MapviewNewComponent', () => {
  let component: MapviewNewComponent;
  let fixture: ComponentFixture<MapviewNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapviewNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapviewNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
