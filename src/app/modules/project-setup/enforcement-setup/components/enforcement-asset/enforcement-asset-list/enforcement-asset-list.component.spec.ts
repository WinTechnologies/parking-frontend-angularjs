import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementAssetListComponent } from './enforcement-asset-list.component';

describe('EnforcementAssetListComponent', () => {
  let component: EnforcementAssetListComponent;
  let fixture: ComponentFixture<EnforcementAssetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnforcementAssetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementAssetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
