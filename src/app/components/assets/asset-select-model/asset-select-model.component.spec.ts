import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSelectModelComponent } from './asset-select-model.component';

describe('AssetSelectModelComponent', () => {
  let component: AssetSelectModelComponent;
  let fixture: ComponentFixture<AssetSelectModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetSelectModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSelectModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
