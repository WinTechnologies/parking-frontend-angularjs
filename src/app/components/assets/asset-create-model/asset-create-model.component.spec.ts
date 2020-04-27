import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCreateModelComponent } from './asset-create-model.component';

describe('AssetCreateModelComponent', () => {
  let component: AssetCreateModelComponent;
  let fixture: ComponentFixture<AssetCreateModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetCreateModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetCreateModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
