import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetFieldDialogComponent } from './asset-field-dialog.component';

describe('AssetFieldDialogComponent', () => {
  let component: AssetFieldDialogComponent;
  let fixture: ComponentFixture<AssetFieldDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetFieldDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetFieldDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
