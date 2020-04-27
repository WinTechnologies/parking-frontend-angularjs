import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleNewComponent } from './bundle-new.component';

describe('BundleNewComponent', () => {
  let component: BundleNewComponent;
  let fixture: ComponentFixture<BundleNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BundleNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BundleNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
