import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadService } from '../../../services/upload.service';
import { PgAssetTypeService } from '../services/asset-type.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AssetType } from '../models/asset.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asset-new-type-modal',
  templateUrl: './asset-new-type-modal.component.html',
  styleUrls: ['./asset-new-type-modal.component.scss']
})

export class AssetNewTypeModalComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  categoryAsset: Array<{id: number, category_asset: string}>;
  filteredCategoryAsset: Array<{id: number, category_asset: string}>;
  assetTypeForm: FormGroup;
  picture: File[];
  public options: any;
  public isCreateMode: boolean;

  constructor(
    public router: Router,
    public dialogRef: MatDialogRef<AssetNewTypeModalComponent>,
    private uploadService: UploadService,
    private readonly assetTypeService: PgAssetTypeService,
    private readonly formBuilder: FormBuilder,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('API_ENDPOINT') public apiEndpoint: string
  ) {}

  ngOnInit() {
    this.options = {
      app: 'web',
      section: 'assets',
      sub: ''
    };

    if (Object.keys(this.data).length > 1) {
      this.assetTypeForm = this.formBuilder.group({
        typeName: [this.data.name, Validators.required],
        typeCode: [this.data.code, Validators.required],
        categoryAsset: [this.data.category_asset]
      });
      this.isCreateMode = false;
    } else {
      this.assetTypeForm = this.formBuilder.group({
        typeName: ['', Validators.required],
        typeCode: ['', Validators.required],
        categoryAsset: ['']
      });
      this.isCreateMode = true;
    }

    this.assetTypeService.getCategoryAsset()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(category => {
        this.categoryAsset = category;
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public inputCheck(event: any) {
    const pattern = /[a-zA-Z0-9\/\ ]/;
    const inputChar = event.keyCode ? String.fromCharCode(event.keyCode) : (event.clipboardData).getData('text');
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  applyFilterAssetsType(filter: string) {
    filter = filter.trim().toLowerCase();
    this.filteredCategoryAsset = this.categoryAsset.filter(
      categoryAsset => categoryAsset.category_asset.toLocaleLowerCase().indexOf(filter) >= 0
    );
  }

  onCancel() {
    this.dialogRef.close();
  }

  onAdd() {
    if (!this.picture || !this.assetTypeForm.valid) {
      this.toastrService.error('Please fill all the fields', 'Error!');
      return;
    }

    this.uploadService.uploadOneByPurpose(this.picture, this.options)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(icon_url => {
        this.assetTypeService.create(
          {
            code: this.assetTypeForm.value.typeCode,
            name: this.assetTypeForm.value.typeName,
            icon_url,
            category_asset: this.assetTypeForm.value.categoryAsset !== '' ? this.assetTypeForm.value.categoryAsset : null,
            created_by: this.data.employee_id
          }
        )
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(result => {
            this.dialogRef.close(true);
          }, err => {
            if (err.error && err.error.message) {
              this.toastrService.error(err.error.message, 'Error!');
            } else {
              this.toastrService.error('Fields contain invalid values', 'Error!');
            }
          });
      });
  }

  onUpdate() {
    if (!this.assetTypeForm.valid) {
      this.toastrService.error('Please fill all the fields', 'Error!');
      return;
    }
    if (!this.picture || !this.picture.length) {
      this.updateAssetType();
    } else {
      this.uploadService.uploadOneByPurpose(this.picture, this.options)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(icon_url => {
          this.updateAssetType(icon_url);
        });
    }
  }

  updateAssetType(icon_url = null) {
    const categoryId: number = this.categoryAsset.find(category => category.category_asset === this.assetTypeForm.value.categoryAsset).id;
    const data: AssetType = {
      id: this.data.id,
      code: this.assetTypeForm.value.typeCode,
      name: this.assetTypeForm.value.typeName,
      category_id: categoryId, // this.assetTypeForm.value.categoryAsset !== '' ? this.assetTypeForm.value.categoryAsset : null,
      icon_url: icon_url ? icon_url : this.data.icon_url,
      created_by: this.data.employee_id
    };

    this.assetTypeService.update(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        this.dialogRef.close(true);
      }, err => {
        if (err.error && err.error.message) {
          this.toastrService.error(err.error.message, 'Error!');
        } else {
          this.toastrService.error('Fields contain invalid values', 'Error!');
        }
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

  defineUrl(iconUrl): string {
    if (iconUrl && (iconUrl.startsWith('uploads') || iconUrl.startsWith('resource'))) {
      return `${this.apiEndpoint}/${iconUrl}`;
    } else {
      return iconUrl;
    }
  }
}