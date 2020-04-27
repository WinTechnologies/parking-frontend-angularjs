import MapOptions from '../../shared/classes/MapOptions';
import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Asset, AssetModel, AssetType } from './models/asset.model';
import { PgAssetService } from './services/assets.service';
import { Project } from '../projects/models/project.model';
import { CurrentUserService } from '../../services/current-user.service';
import { PgProjectsService } from '../projects/services/projects.service';
import { MatDialog } from '@angular/material';
import { AssetNewTypeModalComponent } from './asset-new-type-modal/asset-new-type-modal.component';
import { AssetCreateModelComponent } from './asset-create-model/asset-create-model.component';
import { AlertdialogComponent } from '../alertdialog/alertdialog.component';
import { ToastrService } from 'ngx-toastr';
import { PgAssetTypeService } from './services/asset-type.service';
import { PgAssetModelsService } from './services/assets-models.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { TableColumnsEditModalComponent } from '../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})

export class AssetsComponent implements OnInit, OnChanges, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input() project: Project;
  @Input() singleProjectMode?: boolean;

  assetTypes: AssetType [];
  filteredAssets: AssetType[];

  projectId: number;
  projects: any[];
  assetItems: Asset[];

  selectedTypeCode = '';
  selectedModelCode: string;

  selectedType: AssetType;
  selectedModel: AssetModel;
  selectedInstance: Asset;

  typeDataSource: any = [];
  modelDataSource: any = [];
  instanceDataSource: any = [];

  typeDataSourceOrigin: any = [];
  modelDataSourceOrigin: any = [];
  instanceDataSourceOrigin: any = [];

  isListView: boolean;
  tableDisplayMode = 'ASSET_TYPE'; // 'ASSET_MODEL', 'ASSET_INSTANCE'

  loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  typeDisplayedColumnsOrigin = [
    {name: 'icon_url', label: 'Picture', isShow: true},
    {name: 'code', label: 'Type Code', isShow: true},
    {name: 'name', label: 'Type Name', isShow: true},
    {name: 'category_asset', label: 'Category', isShow: true},
    {name: 'model_count', label: 'Models', isShow: true},
    {name: 'total', label: 'Total', isShow: true},
    {name: 'installed', label: 'Installed', isShow: true},
    {name: 'available', label: 'Available', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];

  typeColumns: any = [];
  typeDisplayedColumns: any = [];

  modelDisplayedColumnsOrigin = [
    {name: 'img_url', label: 'Picture', isShow: true},
    {name: 'name', label: 'Name', isShow: true},
    {name: 'code', label: 'Code', isShow: true},
    {name: 'type_asset', label: 'Type', isShow: true},
    {name: 'category_asset', label: 'Category', isShow: true},
    {name: 'manufacturer', label: 'Manufacturer', isShow: true},
    {name: 'configurations', label: 'Configurations', isShow: true},
    {name: 'firmware_version', label: 'Firmware Version', isShow: true},
    {name: 'product_warranty', label: 'Product Warranty', isShow: true},
    {name: 'notes', label: 'Notes', isShow: true},
    {name: 'instance_count', label: 'Instances', isShow: true},
    {name: 'fullspecs_link', label: 'View Spec', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];

  modelColumns: any = [];
  modelDisplayedColumns: any = [];

  instanceDisplayedColumnsOrigin = [
    {name: 'codification_id', label: 'Codification Id', isShow: true},
    {name: 'city_txt', label: 'City', isShow: true},
    {name: 'model_txt', label: 'Model', isShow: true},
    {name: 'project_name', label: 'Project', isShow: true},
    {name: 'zone_txt', label: 'Zone', isShow: true},
    {name: 'date_deployed', label: 'Date of deployment', isShow: true},
    {name: 'date_end_of_life', label: 'End of Life', isShow: true},
    {name: 'status', label: 'Status', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];

  instanceColumns: any = [];
  instanceDisplayedColumns: any = [];

  mapOptions: MapOptions;
  mapCenter: any;
  mapdata = '{"type": "FeatureCollection", "features": []}';
  filterValue = '';

  // Permission Feature
  currentUser: any;
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  isLoading = false;
  switchComponent = false;
  params: any;
  selectParams: any;
  isModelView = false;
  isSelectView = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private readonly assetService: PgAssetService,
    private readonly assetTypeService: PgAssetTypeService,
    private readonly assetModelService: PgAssetModelsService,
    private currentUserService: CurrentUserService,
    private projectService: PgProjectsService,
    private readonly toastr: ToastrService,
    @Inject('API_ENDPOINT') public apiEndpoint: string
  ) {
    this.mapOptions = new MapOptions(
      true,
      false,
      false,
      false,
      false,
      { lat:  48.864716, lng:  2.349014}
    );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async ngOnInit() {
    try {
      const currentUser = await this.currentUserService.get();
      this.currentUser = currentUser;
      this.permission = CurrentUserService.canFeature(currentUser, this.project ? 'project_assets' : 'global_assets');
      this.getAssetType();
    } finally { }
    this.typeDisplayedColumnsOrigin.forEach(field => {
      this.typeDisplayedColumns.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });
    this.typeColumns = this.typeDisplayedColumns;
    this.modelDisplayedColumnsOrigin.forEach(field => {
      this.modelDisplayedColumns.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });

    this.modelColumns = this.modelDisplayedColumns;
    this.instanceDisplayedColumnsOrigin.forEach(field => {
      this.instanceDisplayedColumns.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });
    this.instanceColumns = this.instanceDisplayedColumns;
    this.params = null;
    this.selectParams = null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.project && !changes.project.firstChange) {
      this.getAssetType();
    }
  }

  private getAssetType() {
    if (!this.singleProjectMode) {
      this.assetTypeService.getAll()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(assetTypes => {
        this.assetTypes = assetTypes;
        this.filteredAssets = this.assetTypes;
        this.getStats();
        if (!this.project) {
          this.getProjects();
          this.getAssets();
        }
      });
    } else {
      this.projectId = this.project.id;
      this.assetService.get({project_id: this.project.id})
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(projectAssets => {
        this.assetItems = projectAssets;
        const res = projectAssets.reduce((acc, asset, index) => {
          if (index === 0) {
            acc.push(asset.type_asset);
            return acc;
          } else if (acc.length > 0 && acc.indexOf(asset.type_asset) === -1) {
            acc.push(asset.type_asset);
            return acc;
          } else {
            return acc;
          }
        }, []).filter(name => name);
        this.assetTypeService.getAll()
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(assetTypes => {
          this.assetTypes = assetTypes.filter(type => res.indexOf(type.name) > -1);
          this.filteredAssets = this.assetTypes;
          this.getStats();
          this.fetchMatTable(this.assetTypes, 'type');
          this.fetchMatTable(this.assetItems, 'instance');
        });
      });
    }
  }

  private getStats() {
    const list: any = {};

    this.assetTypes.forEach(v => {
      list[v.code] = v.code;
    });

    if (this.project) {
      list['project_id'] = this.project.id;
    } else {
      if (this.projectId) {
        list['project_id'] = this.projectId;
      }
    }

    this.assetService.getStats(list).pipe(takeUntil(this.ngUnsubscribe)).subscribe( res => {
      Object.keys(list).forEach((field, index) => {
        const assets_index = this.assetTypes.findIndex(v => v.code === field);
        if (assets_index !== -1) {
          this.assetTypes[assets_index].model_count = res[4 * index];
          this.assetTypes[assets_index].total = res[4 * index + 1];
          this.assetTypes[assets_index].installed = res[4 * index + 2];
          this.assetTypes[assets_index].available = res[4 * index + 3];
        }
      });
    });
  }

  private getProjects() {
    this.projectService.getAllUserProjects()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.projects = res;
      });
  }

  private getAssets() {
    const param: any = {};
    if (this.projectId) {
      param['project_id'] = this.projectId;
    }
    if (this.selectedTypeCode) {
      param['type_asset'] = this.selectedTypeCode;
    }
    if (this.selectedModelCode) {
      param['model_code'] = this.selectedModelCode;
    }

    this.loadingSubject.next(true);
    this.isLoading = true;
    this.assetService.get(param)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(res => {
        this.assetItems = res;
        this.fetchMatTable(this.assetTypes, 'type');
        this.fetchMatTable(this.assetItems, 'instance');
      });
    this.isLoading = false;
  }

  private fetchMatTable(items: any[], dataType: string): void {
    if (dataType === 'type') {
      this.typeDataSource = items;
      this.typeDataSourceOrigin = items;
    } else if (dataType === 'model') {
      this.modelDataSource = items;
      this.modelDataSourceOrigin = items;
    } else if (dataType === 'instance') {
      this.instanceDataSource = items;
      this.instanceDataSourceOrigin = items;
      if (items && items.length) {
        this.onSelectRow(items[0], 'instance');
      }
    }
  }

  public applyFilterAssets(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    this.filteredAssets = this.assetTypes.filter(asset => {
      return asset.name.toLocaleLowerCase().indexOf(filterValue) >= 0;
    });
    if (this.typeDataSourceOrigin) {
      this.typeDataSource = this.typeDataSourceOrigin.filter(row => {
        let bRet = false;
        this.typeColumns.forEach(value => {
          if (row[value.name]) {
            bRet = bRet || (row[value.name].toString().toLowerCase().indexOf(filterValue) >= 0);
          }
        });
        return bRet;
      });
    }
    if (this.modelDataSourceOrigin) {
      this.modelDataSource = this.modelDataSourceOrigin.filter(row => {
        let bRet = false;
        this.modelColumns.forEach(value => {
          if (row[value.name]) {
            bRet = bRet || (row[value.name].toString().toLowerCase().indexOf(filterValue) >= 0);
          }
        });
        return bRet;
      });
    }
    if (!this.project && this.instanceDataSourceOrigin) {
      this.instanceDataSource = this.instanceDataSourceOrigin.filter(row => {
        let bRet = false;
        this.instanceColumns.forEach(value => {
          if (row[value.name]) {
            bRet = bRet || (row[value.name].toString().toLowerCase().indexOf(filterValue) >= 0);
          }
        });
        return bRet;
      });
    }
  }

  public onCreate() {
    if (this.projectId) {
      this.selectParams = {project_id: this.projectId, employee_id: this.currentUser.employee_id};
    } else {
      this.selectParams = {employee_id: this.currentUser.employee_id};
    }

    this.isListView = false;
    this.switchComponent = true;
    this.isSelectView = true;
    this.isModelView = false;
  }

  public goIntoTypeDetail(type_code: string, forceRefresh = false) {
    this.tableDisplayMode = 'ASSET_MODEL';
    this.selectedTypeCode = type_code;

    this.selectedType = this.assetTypes.find(v => v.code === this.selectedTypeCode);
    if (!this.selectedType) {
      this.backgroundNavigate(this.selectedType);
      return;
    }
    if (!this.switchComponent) {
      this.onSelectAsset(this.selectedType);
    }
    if (!forceRefresh && this.selectedType.models) {
      this.fetchMatTable(this.selectedType.models, 'model');

    } else {
      const params = { type_asset: this.selectedTypeCode };
      if (this.projectId) {
        params['project_id'] = this.projectId;
      }

      this.loadingSubject.next(true);
      this.assetModelService.getWithCounts(params)
        .pipe(
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false)),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe((models: AssetModel[]) => {
          if (!this.selectedType) {
            this.backgroundNavigate(this.selectedType);
          } else {
            this.selectedType.models = models.map(model => {
              this.selectedModel = model;
              const reqParams = params;
              reqParams['model_code'] = model.code;
              this.assetService.get(reqParams).pipe(takeUntil(this.ngUnsubscribe)).subscribe(assets => {
                model.instance_count = assets.length;
              });
              return model;
            });
            this.fetchMatTable(this.selectedType.models, 'model');
          }
        });
    }
  }

  public editColumns(selectType: string) {
    let showFields = [];
    let originFields = [];
    if (selectType === 'type') {
      showFields = this.typeDisplayedColumns;
      originFields = this.typeDisplayedColumnsOrigin;
    } else if (selectType === 'model') {
      showFields = this.modelDisplayedColumns;
      originFields = this.modelDisplayedColumnsOrigin;
    } else if (selectType === 'instance') {
      showFields = this.instanceDisplayedColumns;
      originFields = this.instanceDisplayedColumnsOrigin;
    }
    const dialogRef = this.dialog.open(TableColumnsEditModalComponent, {
      width: '550px',
      data : {
        showFields: [...showFields],
        originFields: originFields,
      },
    });
    dialogRef.afterClosed().toPromise().then(result => {
      if (result) {
        if (selectType === 'type') {
          this.typeDisplayedColumns = result;
          this.typeColumns = this.typeDisplayedColumns.filter(field => field.isShow);
        } else if (selectType === 'model') {
          this.modelDisplayedColumns = result;
          this.modelColumns = this.modelDisplayedColumns.filter(field => field.isShow);
        } else if (selectType === 'instance') {
          this.instanceDisplayedColumns = result;
          this.instanceColumns = this.instanceDisplayedColumns.filter(field => field.isShow);
        }
      }
    });
  }

  public reorderColumns(event: any, selectType: string) {
    if (selectType === 'type') {
      const newValue = this.typeColumns[event.newValue];
      const prevValue = this.typeColumns[event.prevValue];
      const newIndex = this.typeDisplayedColumns.indexOf(newValue);
      const prevIndex = this.typeDisplayedColumns.indexOf(prevValue);
      let i = 0 ;
      this.typeDisplayedColumns = this.typeDisplayedColumns.map(value => {
        value = i === newIndex ? prevValue : value;
        value = i === prevIndex ? newValue : value;
        i++;
        return value;
      });
      this.typeColumns = this.typeDisplayedColumns.filter(field => field.isShow);
    } else if (selectType === 'model') {
      const newValue = this.modelColumns[event.newValue];
      const prevValue = this.modelColumns[event.prevValue];
      const newIndex = this.modelDisplayedColumns.indexOf(newValue);
      const prevIndex = this.modelDisplayedColumns.indexOf(prevValue);
      let i = 0 ;
      this.modelDisplayedColumns = this.modelDisplayedColumns.map(value => {
        value = i === newIndex ? prevValue : value;
        value = i === prevIndex ? newValue : value;
        i++;
        return value;
      });
      this.modelColumns = this.modelDisplayedColumns.filter(field => field.isShow);
    } else if (selectType === 'instance') {
      const newValue = this.instanceColumns[event.newValue];
      const prevValue = this.instanceColumns[event.prevValue];
      const newIndex = this.instanceDisplayedColumns.indexOf(newValue);
      const prevIndex = this.instanceDisplayedColumns.indexOf(prevValue);
      let i = 0 ;
      this.instanceDisplayedColumns = this.instanceDisplayedColumns.map(value => {
        value = i === newIndex ? prevValue : value;
        value = i === prevIndex ? newValue : value;
        i++;
        return value;
      });
      this.instanceColumns = this.instanceDisplayedColumns.filter(field => field.isShow);
    }
  }

  public goIntoModelDetail(model_code: string) {
    this.tableDisplayMode = 'ASSET_INSTANCE';
    this.selectedModelCode = model_code;
    this.selectedInstance = null;

    this.selectedModel = this.selectedType.models.find(v => v.code === this.selectedModelCode);
    if (this.selectedModel.instances) {
      this.assetItems = this.selectedModel.instances;
      this.selectedModel.instance_count = this.selectedModel.instances.length;
      this.fetchMatTable(this.assetItems, 'instance');
    } else {
      this.getAssets();
    }
  }

  public onSelectRow(event, selectType: string) {
    if (event.type === 'click' && selectType === 'instance') {
      this.selectedInstance = event.row;
      this.setMapOptions();
    }
  }

  private setMapOptions() {
    if (this.selectedInstance) {
      this.mapCenter = [this.selectedInstance.latitude, this.selectedInstance.longitude];
      const assetType = this.assetTypes.find(v => v.code === this.selectedInstance.type_asset);
      const mapdataObj = {
        features: []
      };

      const icon = assetType && assetType.icon_url
        ? (assetType.icon_url.startsWith('uploads')
          ? this.apiEndpoint + '/' + assetType.icon_url
          : assetType.icon_url)
        : 'assets/marker-icon.svg';

      const marker = {
        type: 'Feature',
        properties: {
          options: {
            icon: {
              options: {
                iconUrl: icon,
                iconRetinaUrl: icon,
                iconSize: [48, 48],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [48, 48]
              },
              _initHooksCalled: true
            }
          }
        },
        geometry: {
          type: 'Point',
          coordinates: [this.selectedInstance.latitude, this.selectedInstance.longitude]
        }
      };
      mapdataObj.features.push(marker);
      if (this.mapdata !== JSON.stringify(mapdataObj)) {
        this.mapdata = JSON.stringify(mapdataObj);
      }
    }
  }

  public backgroundNavigate(asset: AssetType) {
    if (!asset) {
      this.tableDisplayMode = 'ASSET_TYPE';
      this.isModelView = true;
      this.isSelectView = false;
    } else {
      this.selectedType = asset;
      if (this.switchComponent) {
        this.goIntoTypeDetail(this.selectedType.code);
      }
    }
  }

  public onSelectAsset(asset: AssetType) {
    if (this.projectId) {
      this.params = { type: asset.code, id: asset.id, project_id: this.projectId, employee_id: this.currentUser.employee_id };
    } else {
      this.params = { type: asset.code, id: asset.id, employee_id: this.currentUser.employee_id };
    }
    if (!this.isListView) {
      this.switchComponent = true;
    }
    this.isSelectView = false;
    this.isModelView = true;
    this.backgroundNavigate(asset);
  }

  public changeSelectProject(event: any) {
    this.projectId = event.value;
    this.selectedInstance = null;
    this.getAssetType();
    if (this.selectedTypeCode) {
      this.goIntoTypeDetail(this.selectedTypeCode, true);
    }
    if (this.switchComponent) {
      if (this.projectId) {
        this.params = {...this.params, project_id: this.projectId};
        this.selectParams = {...this.selectParams, project_id: this.projectId};
      } else {
        this.params = (this.selectedType) ?
          {type: this.selectedType.code, id: this.selectedType.id, employee_id: this.currentUser.employee_id} :
          {employee_id: this.currentUser.employee_id};
        this.selectParams = {employee_id: this.currentUser.employee_id};
      }
    }
    this.onGoBackEvent(true);
  }

  public changeSelectAssetType(event: any) {
    this.selectedTypeCode = event.value;
    this.selectedModelCode = '';
    this.selectedInstance = null;
    this.getAssets();
    this.goIntoTypeDetail(this.selectedTypeCode, false);
  }

  public changeSelectAssetModel(event: any) {
    this.selectedModelCode = event.value;
    this.selectedInstance = null;
    this.getAssets();
    this.goIntoModelDetail(this.selectedModelCode);
  }

  public onSwitchView() {
    this.isListView = !this.isListView;
    if (this.selectedType) {
      this.switchComponent = !this.isListView;
      if (!this.isListView) {
        this.isSelectView = false;
        this.isModelView = true;
      }
    }
  }

  public onSwitchTableView(mode: string) {
    this.tableDisplayMode = mode;
    switch (mode) {
      case 'ASSET_TYPE': {
        this.getAssetType();
        this.selectedModelCode = '';
        break;
      }
      case 'ASSET_MODEL': {
        this.goIntoTypeDetail(this.selectedType.code, true);
        break;
      }
      default:
        break;
    }
    if (!this.selectedType) {
      this.backgroundNavigate(this.selectedType);
    }
  }

  public onEdit(item: any, editType: string) {
    if (editType === 'type') {
      const dialogRef = this.dialog.open(AssetNewTypeModalComponent, {data: item});
      dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
        if (result) {
          this.getAssetType();
        }
      });
    } else if (editType === 'model') {
      const dialogRef = this.dialog.open(AssetCreateModelComponent, {data: {isUpdate: true, updateModel: item}});
      dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
        if (result) {
          const assetModel = result as AssetModel;
          this.assetModelService.update(assetModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            this.toastr.success('Successfully updated!', 'Success!');
            this.goIntoTypeDetail(this.selectedTypeCode, true);
          });
        }
      });
    }
  }

  public onDelete(item: any, deleteType: string) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'Are you sure you want to delete?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      if (result) {
        if (deleteType === 'type') {

          this.assetTypeService.delete(item).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            this.toastr.success(
              'Successfully an asset is deleted!',
              'Success!'
            );
            this.getAssetType();
          });

        } else if (deleteType === 'instance') {
          this.assetService.delete(item).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            this.toastr.success(
              'Successfully an asset is deleted!',
              'Success!'
            );
            this.getAssets();
          }, err => {
            this.toastr.clear();
            this.toastr.error(`The Instance could not be deleted because of ${err.error.message}`, 'Error!');
          });
        } else if (deleteType === 'model') {
          const typeCode = item.type_asset;
          this.assetModelService.delete(item).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            this.toastr.success(
              'Successfully an asset is deleted!',
              'Success!'
            );
            this.getStats();
            this.goIntoTypeDetail(typeCode, true);
          });
        }
      }
    });
  }

  public determineClass() {
    if (this.selectedInstance && this.tableDisplayMode === 'ASSET_INSTANCE') {
      return {
        'col-sm-12': true,
        'col-md-8': true,
        'col-lg-8': true,
      };
    } else {
      return {
        'col-12': true,
      };
    }
  }

  public onGoBackEvent(result: boolean): void {
    if (result) {
      this.switchComponent = !result;
      this.selectedType = null;
      this.backgroundNavigate(this.selectedType);
    } else if (result !== undefined) {
      this.getAssetType();
      if (this.selectedType) {
        this.goIntoTypeDetail(this.selectedType.code, true);
      }
    }
  }

  public validateSpecLink(specLinkValue): string {
    if (specLinkValue && (specLinkValue.startsWith('http') || specLinkValue.startsWith('/'))) {
      return specLinkValue;
    } else if (specLinkValue && (specLinkValue.indexOf('www.') === 0 || specLinkValue.split('.').length > 1)) {
      return `http://${specLinkValue}`;
    } else {
      return '/assets';
    }
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
