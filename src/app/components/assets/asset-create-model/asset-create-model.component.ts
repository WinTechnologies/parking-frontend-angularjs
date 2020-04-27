import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetModel, AssetType } from '../models/asset.model';
import { UploadService } from '../../../services/upload.service';
import { PgAssetModelsService } from '../services/assets-models.service';
import { ToastrService } from 'ngx-toastr';
import { PgAssetTypeService } from '../services/asset-type.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-asset-create-model',
  templateUrl: './asset-create-model.component.html',
  styleUrls: ['./asset-create-model.component.scss']
})

export class AssetCreateModelComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  form: FormGroup;
  picture: File[];
  assetType: AssetType;
  typeAsset: string;
  today = new Date();
  public options: any;

  constructor(
    public dialogRef: MatDialogRef<AssetCreateModelComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly uploadService: UploadService,
    private readonly assetModelsService: PgAssetModelsService,
    private readonly assetTypeService: PgAssetTypeService,
    private readonly toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('API_ENDPOINT') public apiEndpoint: string
  ) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.options = {
      app: 'web',
      section: 'assets',
      sub: ''
    };

    if (this.data.isUpdate) {
      this.typeAsset = this.data.updateModel.type_asset;
      this.buildUpdateForm(this.data.updateModel);
    } else {
      this.assetTypeService.getAll({code: this.data}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.assetType = res[0];
        this.typeAsset = this.data;
        this.buildNewForm();
      });
    }
  }

  private buildNewForm() {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      type_asset: [this.typeAsset, [Validators.required]],
      manufacturer: ['', [Validators.required]],
      configurations: ['', [Validators.required]],
      firmware_version: ['', [Validators.required]],
      product_warranty: ['', [Validators.required]],
      notes: [''],
      fullspecs_link: ['', [Validators.required]],
      category_asset: [this.assetType.category_asset],
    });
  }

  private buildUpdateForm(data) {
    this.form = this.formBuilder.group({
      name: [data.name, [Validators.required]],
      type_asset: [data.type_asset, [Validators.required]],
      manufacturer: [data.manufacturer, [Validators.required]],
      configurations: [data.configurations, [Validators.required]],
      firmware_version: [data.firmware_version, [Validators.required]],
      product_warranty: [data.product_warranty, [Validators.required]],
      notes: [data.notes],
      fullspecs_link: [data.fullspecs_link, [Validators.required]],
      category_asset: [data.category_asset],
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

  public onCancel() {
    this.dialogRef.close();
  }

  public onAdd() {
    if (!this.picture) {
      this.toastr.error('Please add a Picture', 'Error!');
      return;
    }
    if (this.form.valid) {
      let assetModel: AssetModel;
      assetModel = this.form.value;
      this.uploadService.uploadOneByPurpose(this.picture, this.options)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        assetModel.img_url = res;
        this.dialogRef.close(this.form.value);
      });
    }
  }

  public onUpdate() {
    if (!this.form.valid) {
      this.toastr.error('Please fill all the fields', 'Error!');
      return;
    }
    if (!this.picture || !this.picture.length) {
      let assetModel: AssetModel;
      assetModel = this.form.value;
      assetModel.id = this.data.updateModel.id;
      assetModel.img_url = this.data.updateModel.img_url;
      this.dialogRef.close(assetModel);
    } else {
      let assetModel: AssetModel;
      assetModel = this.form.value;
      assetModel.id = this.data.updateModel.id;
      this.uploadService.uploadOneByPurpose(this.picture, this.options)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        assetModel.img_url = res;
        this.dialogRef.close(assetModel);
      });
    }
  }

  defineUrl(iconUrl): string {
    if (iconUrl && (iconUrl.startsWith('uploads') || iconUrl.startsWith('resource'))) {
      return `${this.apiEndpoint}/${iconUrl}`;
    } else {
      return iconUrl;
    }
  }
}