import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AssetField, globalAssetFields, AssetFieldType } from '../models/asset.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { AssetFieldDialogComponent } from '../asset-field-dialog/asset-field-dialog.component';

@Component({
  selector: 'app-asset-new-type',
  templateUrl: './asset-new-type.component.html',
  styleUrls: ['./asset-new-type.component.scss']
})

export class AssetNewTypeComponent implements OnInit {
  AssetFieldType = AssetFieldType;

  form : FormGroup;
  assetFields: AssetField[] = JSON.parse(JSON.stringify(globalAssetFields));
  imageBase64: string | ArrayBuffer | null;
  files: File[];
  picture: File[];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private readonly formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  public onBack() {
    this.location.back();
  }

  public onSubmit() {
    if (this.form.valid) {}
  }

  public onDelete(index: number) {
    this.assetFields.splice(index, 1);
  }

  public onAdd() {
    const dialogRef = this.dialog.open(AssetFieldDialogComponent, {
      width: '760px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.assetFields.push(result);
      }
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]]
    });
  }

  onPictureRemoved(event: any) {
    this.picture = event.currentFiles;
  }

  onPictureAdded(event: any) {
    this.picture = event.currentFiles;
  }

  onPictureAction(event: any) {
    this.picture = event.currentFiles;
  }

  onFilesRemoved(event: any) {
    this.files = event.currentFiles;
  }

  onFilesAdded(event: any) {
    this.files = event.currentFiles;
  }

  onFilesAction(event: any) {
    this.files = event.currentFiles;
  }

  onCancel() {
    this.router.navigate(['assets']);
  }
}