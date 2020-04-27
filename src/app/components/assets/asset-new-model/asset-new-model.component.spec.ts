import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetNewComponent } from './asset-new-model.component';

describe('AssetNewModelComponent', () => {
  let component: AssetNewModelComponent;
  let fixture: ComponentFixture<AssetNewModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetNewModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetNewModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
