import { Component, Inject, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetType } from '../models/asset.model';
import { PgAssetTypeService } from '../services/asset-type.service';
import { AssetNewTypeModalComponent } from '../asset-new-type-modal/asset-new-type-modal.component';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-asset-select',
  templateUrl: './asset-select.component.html',
  styleUrls: ['./asset-select.component.scss']
})

export class AssetSelectComponent implements OnInit, OnChanges, OnDestroy {
  @Input() params?: any;
  @Output() goBackEvent = new EventEmitter<boolean>();
  ngUnsubscribe: Subject<void> = new Subject<void>();
  assets: AssetType[];
  selectedAssetItem: AssetType;
  filterAssets: AssetType[];

  project_id: number;
  employee_id: string;

  routeParams: any;
  switchComponent = false;

  constructor(
    private readonly assetTypeService: PgAssetTypeService,
    private location: Location,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    @Inject('API_ENDPOINT') public apiEndpoint: string
  ) {
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
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
      if (this.params['project_id']) {
        this.project_id = this.params['project_id'];
      } else {
        this.project_id = null;
      }
      if (this.params['employee_id']) {
        this.employee_id = this.params['employee_id'];
      }
      this.onSelectAsset(this.selectedAssetItem);
    }
  }

  ngOnInit() {
    this.initActions();
  }

  private initActions() {
    if (this.params['project_id']) {
      this.project_id = this.params['project_id'];
    } else {
      this.project_id = null;
    }
    if (this.params['employee_id']) {
      this.employee_id = this.params['employee_id'];
    }
    this.assetTypeService.getAll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(assetType => {
      this.assets = assetType;
      this.filterAssets = this.assets.map(x => Object.assign({}, x));
      this.selectedAssetItem = this.filterAssets[0];
    });
  }

  public onBack() {
    this.goBackEvent.emit(true);
  }

  public onAddNewType() {
    const dialog = this.dialog.open(AssetNewTypeModalComponent, {data: {employee_id: this.employee_id}});
    dialog.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.assetTypeService.getAll()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(assetType => {
        this.assets = assetType;
        this.filterAssets = this.assets.map(x => Object.assign({}, x));
        this.selectedAssetItem = this.filterAssets[0];
        this.goBackEvent.emit(false);
      });
    });
  }

  public onSelectAsset(asset: AssetType) {
    this.switchComponent = true;
    this.selectedAssetItem = asset;

    if (this.project_id) {
      this.routeParams = { type: asset.code, id: asset.id, project_id: this.project_id, employee_id: this.employee_id };
    } else {
      this.routeParams = { type: asset.code, id: asset.id, employee_id: this.employee_id };
    }
  }

  public onGoBackEvent(result: boolean): void {
    if (result) {
      this.switchComponent = !result;
    } else {
      this.goBackEvent.emit(false);
    }
  }
}