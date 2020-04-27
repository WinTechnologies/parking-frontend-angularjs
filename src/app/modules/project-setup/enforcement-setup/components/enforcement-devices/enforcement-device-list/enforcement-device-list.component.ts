import {Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {EnforcementDeviceNewComponent} from '../enforcement-device-new/enforcement-device-new.component';
import {forkJoin} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {EnforcementItem} from '../../../models/enforcement.model';
import {Project} from '../../../../../../components/projects/models/project.model';
import {PgProjectsService} from '../../../../../../components/projects/services/projects.service';
import {PgAssetService} from '../../../../../../components/assets/services/assets.service';
import {Asset} from '../../../../../../components/assets/models/asset.model';
import {AlertdialogComponent} from '../../../../../../components/alertdialog/alertdialog.component';
import {Employee} from '../../../../../../components/employees/models/employee.model';
import {TableColumnsEditModalComponent} from '../../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-enforcement-device-list',
  templateUrl: './enforcement-device-list.component.html',
  styleUrls: ['./enforcement-device-list.component.scss']
})
export class EnforcementDeviceListComponent implements OnInit, OnChanges {
  @Input() projectId: number;
  @Input() enforcementItem: EnforcementItem;

  devices: Asset[];

  project: Project;

  displayedColumns = [
    {name: 'avatar', label: 'Avatar', isShow: true},
    {name: 'codification_id', label: 'Codification Id', isShow: true},
    {name: 'model_txt', label: 'Model', isShow: true},
    {name: 'asset_notes', label: 'Description', isShow: true},
    {name: 'status', label: 'Status', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];
  tableFields = [];
  showFields = [];

  constructor(
    private readonly projectService: PgProjectsService,
    // private readonly deviceService: PgDeviceService,
    private readonly assetService: PgAssetService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    @Inject('API_ENDPOINT') public apiEndpoint
  ) { }

  ngOnInit() {
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.projectId || changes.enforcementItem) {
      this.getDevices();
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

  private getDevices(): void {
    const observable = [];
    observable.push(this.assetService.getDevices({status: 'Installed', project_id: this.projectId}));
    observable.push(this.projectService.getProjectById(this.projectId));

    forkJoin(observable).subscribe( res => {
      const [device, project] = res;
      this.devices = device as Asset[];
      this.project = project as Project;
    });
  }

  public onAdd() {
    const dialogRef = this.dialog.open(EnforcementDeviceNewComponent, {
      width: '80%',
      data: {projectId: this.projectId}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const devices: Asset[] = result;
        const observable = [];

        devices.forEach(device => {
          device.project_id = this.projectId;
          device.project_name = this.project.project_name;
          device.status = 'Installed';
          delete device['checked'];
          observable.push(this.assetService.update(device));
        });

        if (observable.length) {
          forkJoin(observable).subscribe( res => {
            this.toastr.success('The device is added successfully!', 'Success!');
            this.getDevices();
          });
        }
      }
    });
  }

  public onDelete(device: Asset) {
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
        device.project_id = 0;
        device.deployed_at = null;
        device.project_name = '';
        device.status = 'Available';
        this.assetService.update(device).subscribe(res => {
          this.toastr.success('The Device is deleted successfully!', 'Success!');
          this.getDevices();
        });
      }
    });
  }

}
