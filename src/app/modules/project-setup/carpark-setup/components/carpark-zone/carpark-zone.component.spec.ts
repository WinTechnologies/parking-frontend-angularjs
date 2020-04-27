import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CarparkZoneComponent } from './carpark-zone.component';


describe('CarparkZoneComponent', () => {
  let component: CarparkZoneComponent;
  let fixture: ComponentFixture<CarparkZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarparkZoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarparkZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
