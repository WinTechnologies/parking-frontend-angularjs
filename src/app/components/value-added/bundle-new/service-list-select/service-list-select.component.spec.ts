import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceListSelection } from './service-list-select.component';


describe('ServiceListSelection', () => {
  let component: ServiceListSelection;
  let fixture: ComponentFixture<ServiceListSelection>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceListSelection ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceListSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
