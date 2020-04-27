import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Asset} from '../../../../../../components/assets/models/asset.model';
import {PgAssetService} from '../../../../../../components/assets/services/assets.service';
import {TableColumnsEditModalComponent} from '../../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-enforcement-device-new',
  templateUrl: './enforcement-device-new.component.html',
  styleUrls: ['./enforcement-device-new.component.scss']
})
export class EnforcementDeviceNewComponent implements OnInit {

  devices: Asset[];

  devicesOrigin: Asset[];
  allChecked: boolean;

  displayedColumns = [
    {name: 'checkbox', label: 'Selection', isShow: true},
    {name: 'avatar', label: 'Picture', isShow: true},
    {name: 'codification_id', label: 'Codification Id', isShow: true},
    {name: 'model_txt', label: 'Model', isShow: true},
    {name: 'asset_notes', label: 'Description', isShow: true},
    {name: 'status', label: 'Status', isShow: true}
  ];
  tableFields = [];
  showFields = [];

  selectedCount = 0;
  projectId: number;

  constructor(
    public dialogRef: MatDialogRef<EnforcementDeviceNewComponent>,
    private readonly assetService: PgAssetService,
    private dialog: MatDialog,
    @Inject('API_ENDPOINT') public apiEndpoint: string,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.projectId = data.projectId;
  }

  ngOnInit() {
    // Fixed Expression has been changed after checked Error by Settimeout()
    setTimeout(() => this.getDevices(), 0);
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

  private getDevices(): void {
    this.assetService.getDevices({status: 'Available'}).subscribe(res => {
      this.devices = res;
    });
  }

  private calculateSelectedCount() {
    this.selectedCount = this.devices.filter(e => e['checked']).length;
  }

  public applyFilterDevice(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.devicesOrigin) {
      this.devices = this.devicesOrigin.filter(row => {
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
    this.devices.forEach(device => {
      device['checked'] = this.allChecked;
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
    const filteredDevices = this.devices.filter(e => e['checked']);
    this.dialogRef.close(filteredDevices);
  }
}
