import { Component, Inject, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy} from '@angular/core';
import { Asset, AssetModel, AssetType } from '../models/asset.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PgAssetService } from '../services/assets.service';
import { forkJoin, Subject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { AssetCreateModelComponent } from '../asset-create-model/asset-create-model.component';
import { PgAssetModelsService } from '../services/assets-models.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../../services/current-user.service';
import { PgAssetTypeService } from '../services/asset-type.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-asset-select-model',
  templateUrl: './asset-select-model.component.html',
  styleUrls: ['./asset-select-model.component.scss']
})

export class AssetSelectModelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() params?: any;
  @Output() goBackEvent = new EventEmitter<boolean>();
  ngUnsubscribe: Subject<void> = new Subject<void>();

  assets: AssetType[];
  assetType: string;
  assetIcon: string;
  project_id: number;
  employee_id: string;
  assetId: number;

  currentUser: any;
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  switchComponent = false;
  routeParams: any;

  constructor(
    public router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private readonly assetService: PgAssetService,
    private readonly assetModelService: PgAssetModelsService,
    private toastr: ToastrService,
    private currentUserService: CurrentUserService,
    private readonly assetTypeService: PgAssetTypeService,
    @Inject('API_ENDPOINT') public apiEndpoint: string
  ) {
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      if (params['type']) {
        this.assetType = params['type'];
        this.assetTypeService.getAll()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(assetType => {
          const asset = assetType.find(type => type.name === this.assetType);
          if (asset) {
            this.assetIcon = asset.icon_url;
          }
        });
      }
      if (params['id']) {
        this.assetId = +params['id'];
      }
      if (params['project_id']) {
        this.project_id = params['project_id'];
      }
      if (params['employee_id']) {
        this.employee_id = params['employee_id'];
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.params && !changes.params.firstChange) {
      this.initActions();
      this.getModels();
    }
  }

  ngOnInit() {
    this.initActions();
    this.currentUserService.get().then(user => {
      const currentUser = user;
      this.permission = CurrentUserService.canFeature(currentUser, 'global_assets');
      this.getModels();
    });
  }

  private initActions() {
    if (this.params && this.params['type']) {
      this.assetType = this.params['type'];
      this.assetTypeService.getAll()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(assetType => {
        const asset = assetType.find(type => type.name === this.assetType);
        if (asset) {
          this.assetIcon = asset.icon_url;
        }
      });
    }
    this.assetId = +this.params['id'];
    this.project_id = this.params['project_id'];
    this.employee_id = this.params['employee_id'];

    this.assetTypeService.getAll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(assetType => {
      const asset = assetType.find(type => type.name === this.assetType);
      if (asset) {
        this.assetIcon = asset.icon_url;
      }
    });
  }

  private getModels() {
    const assetItems: AssetType[] = [];
    const params = {
      type_id: this.assetId
    };
    this.assetModelService.get(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe( models => {
      if (models.length) {
        const observable = [];
        models.forEach(model => {
          const params1 = {
            model_txt: model.name
          };
          if (this.project_id) {
            params1['project_id'] = this.project_id;
          }
          observable.push(this.assetService.get(params1));
          const item = new AssetType();
          item.name = model.name;
          // item.icon_url = this.assetIcon;
          item.icon_url = model.img_url;
          item.code = this.assetType;

          assetItems.push(item);
        });
        this.assets = assetItems;
        forkJoin(observable).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          for (let i = 0; i < res.length; i++) {
            const item = assetItems[i];
            const assets = res[i] as Asset[];
            const available  = assets.filter(v => v.status === 'Available');
            const installed  = assets.filter(v => v.status === 'Installed');
            item.available = available.length;
            item.installed = installed.length;
            item.total = assets.length;
          }
        });
      }
    });
  }

  public onBack() {
    this.goBackEvent.emit(true);
  }

  public onCreateModel(model: AssetType) {
    if (!this.permission.isUpdate) {
      this.currentUserService.showNotAccessToastr();
      return;
    }
    const params = {
      id: this.assetId, type: this.assetType, name: model.name, employee_id: this.employee_id
    };
    if (this.project_id) {
      params['project_id'] = this.project_id;
    }
    this.switchComponent = true;
    this.routeParams = params;
  }

  public onAddNewModel() {
    const dialogRef = this.dialog.open(AssetCreateModelComponent, {
      width: '70%',
      data: this.assetType,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      if (result) {
        const assetModel = result as AssetModel;
        assetModel.type_id = this.assetId;
        assetModel.created_by = this.employee_id;
        this.assetModelService.create(assetModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.getModels();
          this.toastr.success('Successfully new model is created!', 'Success!');
          this.goBackEvent.emit(false);
        }, err => {
          if (err.error && err.error.message) {
            this.toastr.error(err.error.message, 'Error!');
          } else {
            this.toastr.error('Fields contain invalid values', 'Error!');
          }
        });
      }
    });
  }

  public onGoBackEvent(result: boolean): void {
    if (result) {
      this.switchComponent = !result;
      this.goBackEvent.emit(false);
      this.getModels();
    }
  }
}