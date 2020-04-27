import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementAssetNewComponent } from './enforcement-asset-new.component';

describe('EnforcementAssetNewComponent', () => {
  let component: EnforcementAssetNewComponent;
  let fixture: ComponentFixture<EnforcementAssetNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementAssetNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementAssetNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
