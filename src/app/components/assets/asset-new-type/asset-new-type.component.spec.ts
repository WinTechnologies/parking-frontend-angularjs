import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetNewTypeComponent } from './asset-new-type.component';

describe('AssetNewTypeComponent', () => {
  let component: AssetNewTypeComponent;
  let fixture: ComponentFixture<AssetNewTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetNewTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetNewTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
