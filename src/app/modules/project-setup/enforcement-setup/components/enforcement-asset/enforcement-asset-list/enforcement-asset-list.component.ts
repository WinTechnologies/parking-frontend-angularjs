import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {PgAssetService} from '../../../../../../components/assets/services/assets.service';
import {EnforcementItem, EnforcementType} from '../../../models/enforcement.model';
import {MatDialog, MatTableDataSource} from '@angular/material';
import {ToastrService} from 'ngx-toastr';
import {Asset} from '../../../../../../components/assets/models/asset.model';
import {forkJoin} from 'rxjs';
import {EnforcementAssetNewComponent} from '../enforcement-asset-new/enforcement-asset-new.component';
import {PgProjectsService} from '../../../../../../components/projects/services/projects.service';
import {Project} from '../../../../../../components/projects/models/project.model';
import {AlertdialogComponent} from '../../../../../../components/alertdialog/alertdialog.component';
import {TableColumnsEditModalComponent} from '../../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-enforcement-asset-list',
  templateUrl: './enforcement-asset-list.component.html',
  styleUrls: ['./enforcement-asset-list.component.scss']
})
export class EnforcementAssetListComponent implements OnInit, OnChanges {
  @Input() projectId: number;
  @Input() enforcementItem: EnforcementItem;

  assets: Asset[];
  project: Project;
  type: string;

  dataSource: MatTableDataSource<Asset>;

  tableFields = [];
  showFields = [];
  displayedColumns = [];

  vehicleColumns = [
    {name: 'codification_id', label: 'Codification Id', isShow: true},
    {name: 'model_txt', label: 'Model', isShow: true},
    {name: 'project_name', label: 'Project', isShow: true},
    {name: 'zone_txt', label: 'Zone', isShow: true},
    {name: 'vehicle_plate', label: 'License Plate', isShow: true},
    {name: 'vehicle_brand', label: 'Asset Brand', isShow: true},
    {name: 'status_vehicle', label: 'Vehicle Status', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];

  clampColumns = [
    {name: 'codification_id', label: 'Codification Id', isShow: true},
    {name: 'model_txt', label: 'Model', isShow: true},
    {name: 'project_name', label: 'Project', isShow: true},
    {name: 'zone_txt', label: 'Zone', isShow: true},
    {name: 'ip_address', label: 'IP Address', isShow: true},
    {name: 'asset_notes', label: 'Description', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];

  constructor(
    private readonly assetService: PgAssetService,
    private readonly projectService: PgProjectsService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.projectId || changes.enforcementItem) {
      this.type =  EnforcementType[this.enforcementItem.type];
      this.getAssets();
      this.displayedColumns = [];
      this.showFields = [];
      this.tableFields = [];
      if (this.type === 'Van' || this.type === 'Truck') {
        this.displayedColumns = this.vehicleColumns;
      }
      if (this.type === 'Clamp') {
        this.displayedColumns = this.clampColumns;
      }
      this.displayedColumns.forEach(field => {
        this.showFields.push(
          {
            name: field.name,
            label: field.label,
            isShow: field.isShow,
          }
        );
      });
      this.tableFields = this.showFields;
    }
  }

  public reorderColumns(event) {
    const newValue = this.tableFields[event.newValue];
    const prevValue = this.tableFields[event.prevValue];
    const newIndex = this.showFields.indexOf(newValue);
    const prevIndex = this.showFields.indexOf(prevValue);
    let i = 0 ;
    this.showFields = this.showFields.map(value => {
      value = i === newIndex ? prevValue : value;
      value = i === prevIndex ? newValue : value;
      i++;
      return value;
    });
    this.tableFields = this.showFields.filter(field => field.isShow);
  }

  public editColumns() {
    const dialogRef = this.dialog.open(TableColumnsEditModalComponent, {
      width: '550px',
      data : {
        showFields: this.showFields,
        originFields: this.displayedColumns,
      },
    });
    dialogRef.afterClosed().toPromise().then(result => {
      if (result) {
        this.showFields = result;
        this.tableFields = this.showFields.filter(field => field.isShow);
      }
    });
  }

  private getAssets() {
    const observable = [];
    observable.push(this.assetService.get({project_id: this.projectId, type_asset: this.type}));
    observable.push(this.projectService.getProjectById(this.projectId));

    forkJoin(observable).subscribe( res => {
      const [asset, project] = res;
      // this.assets = (this.type === 'Van' || this.type === 'Truck') ? asset.filter(vehicle => vehicle.status_vehicle === 'Active') : asset as Asset[];
      this.assets = asset as Asset[];
      this.project = project as Project;
    });
  }

  public onAdd() {
    const dialogRef = this.dialog.open(EnforcementAssetNewComponent, {
      width: '80%',
      data: {projectId: this.projectId, position: this.type}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const assets = result; // : Asset[]
        const observable = [];

        assets.forEach(asset => {
          asset.project_id = this.projectId;
          asset.project_name = this.project.project_name;
          asset.status = 'Installed';
          if (this.type === 'Van' || this.type === 'Truck') {
            asset.status_vehicle = 'Available';
          }
          delete asset['checked'];
          delete asset['city_code'];
          delete asset['category_asset'];
          observable.push(this.assetService.update(asset));
        });

        if (observable.length) {
          forkJoin(observable).subscribe( res => {
            this.toastr.success('The asset is added successfully!', 'Success!');
            this.getAssets();
          });
        }
      }
    });
  }

  public onDelete(asset: Asset) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        asset.project_id = null;
        asset.deployed_at = null;
        asset.project_name = '';
        asset.status = 'Available';
        if (this.type === 'Van' || this.type === 'Truck') {
          asset.status_vehicle = 'Available';
        }
        delete asset['city_code'];
        delete asset['category_asset'];

        this.assetService.update(asset).subscribe(res => {
          this.toastr.success('The Asset is deleted successfully!', 'Success!');
          this.getAssets();
        });
      }
    });
  }

}
