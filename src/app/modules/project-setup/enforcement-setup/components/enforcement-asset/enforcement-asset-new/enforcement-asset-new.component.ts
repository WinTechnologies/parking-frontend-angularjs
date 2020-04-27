import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material';
import {Asset} from '../../../../../../components/assets/models/asset.model';
import {PgAssetService} from '../../../../../../components/assets/services/assets.service';
import {TableColumnsEditModalComponent} from '../../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-enforcement-asset-new',
  templateUrl: './enforcement-asset-new.component.html',
  styleUrls: ['./enforcement-asset-new.component.scss']
})
export class EnforcementAssetNewComponent implements OnInit {
  vehicles: Asset[];
  vehiclesOrigin: Asset[];

  dataSource: MatTableDataSource<Asset>;
  allChecked: boolean;

  tableFields = [];
  showFields = [];
  displayedColumns = [];

  vehicleColumns = [
    {name: 'checkbox', label: 'Selection', isShow: true},
    {name: 'codification_id', label: 'Codification Id', isShow: true},
    {name: 'model_txt', label: 'Model', isShow: true},
    {name: 'zone_txt', label: 'Zone', isShow: true},
    {name: 'vehicle_plate', label: 'License Plate', isShow: true},
    {name: 'vehicle_brand', label: 'Asset Brand', isShow: true},
    {name: 'status_vehicle', label: 'Vehicle Status', isShow: true}
  ];

  clampColumns = [
    {name: 'checkbox', label: 'Selection', isShow: true},
    {name: 'codification_id', label: 'Codification Id', isShow: true},
    {name: 'model_txt', label: 'Model', isShow: true},
    {name: 'zone_txt', label: 'Zone', isShow: true},
    {name: 'ip_address', label: 'IP Address', isShow: true},
    {name: 'asset_notes', label: 'Description', isShow: true}
  ];

  selectedCount = 0;
  projectId: number;
  type: string;

  constructor(
    public dialogRef: MatDialogRef<EnforcementAssetNewComponent>,
    private readonly assetService: PgAssetService,
    private readonly dialog: MatDialog,
    @Inject('API_ENDPOINT') public apiEndpoint: string,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.projectId = data.projectId;
    this.type = data.position;
  }

  ngOnInit() {
    // Fixed Expression has been changed after checked Error by Settimeout()
    setTimeout(() => this.getVehicles(), 0);
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

  public editColumns() {
    const dialogRef = this.dialog.open(TableColumnsEditModalComponent, {
      width: '550px',
      data : {
        showFields: this.showFields,
        originFields: this.displayedColumns,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showFields = result;
        this.tableFields = this.showFields.filter(field => field.isShow);
      }
    });
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

  private getVehicles(): void {
    this.assetService.get({status: 'Available', type_asset: this.type}).subscribe(res => {
      this.vehicles = res;
      this.vehiclesOrigin = this.vehicles;
    });
  }

  private calculateSelectedCount() {
    this.selectedCount = this.vehicles.filter(e => e['checked']).length;
  }

  public applyFilterDevice(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.vehiclesOrigin) {
      this.vehicles = this.vehiclesOrigin.filter(row => {
        let bRet = true;
        let cRet = false;
        this.tableFields.forEach(value => {
          if (row[value.name]) {
            cRet = cRet || (row[value.name].toString().toLowerCase().indexOf(filterValue) >= 0);
          }
        });
        bRet = bRet && cRet;
        return bRet;
      });
    }
    this.calculateSelectedCount();
  }

  public onSelect(event: any) {
    if (event.type === 'click') {
      event.row['checked'] = !event.row['checked'];
      this.calculateSelectedCount();
    }
  }

  public changeAllCheck() {
    this.vehicles.forEach(asset => {
      asset['checked'] = this.allChecked;
    });
    this.calculateSelectedCount();
  }

  public changeCheckItem() {
    this.calculateSelectedCount();
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public onAdd() {
    const filteredAssets = this.vehicles.filter(e => e['checked']);
    this.dialogRef.close(filteredAssets);
  }
}
