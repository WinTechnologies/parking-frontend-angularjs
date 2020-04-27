import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource, MatMenuModule } from '@angular/material';
import { CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Contravention } from '../../../../shared/classes/contravention';
import { ContraventionService } from '../../../../services/contravention.service';
import { FormControl, FormGroup } from '@angular/forms';
import { PgProjectsService } from '../../../../components/projects/services/projects.service';
import { config } from '../../../../../config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MqttService } from 'ngx-mqtt';
import { CN_List_Fields, CN_Status } from '../../fixtures/contravention.fixture';
import { LoaderService } from '../../../../services/loader.service';
import { Filter, MatTableFilterService } from '../../../../services/mat-table-filter.service';
import { TableColumnsEditModalComponent } from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-contravention',
  templateUrl: './contravention.component.html',
  styleUrls: ['./contravention.component.scss']
})

export class ContraventionComponent implements OnInit {
    private sort: MatSort;
    @ViewChild(MatSort) set matSort(ms: MatSort) {
        this.sort = ms;
        this.setDataSourceAttributes();
    }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  previousIndex: number;
  displayedColumns1: string[] = [];

  contraventions: Array<Contravention> = [];

  dataSource: any;
  filter: Filter<any>;
  contraventionsOrigin: Array<Contravention> = [];
  selectedContravention: Contravention;

  showFields = [];
  tableFields = [];
  displayedColumns = CN_List_Fields;
  isLoading = false;

  filterValue = '';
  crmForm: FormGroup;
  from = new Date();
  to = new Date();
  projects: any[];
  project_id: any;

  statusLabels = config.contraventionStatus;
  statusCodes = [];
  statusList = CN_Status;
  mqttTopics = config.mqttTopics.contravention;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public isDetailOn = false;
  selectedRowIndex: number = -1;
  public cnList: any[];
  public pageSize:number = 10;
  public refreshCount = 0;

  constructor(
    private contraventionService: ContraventionService,
    private projectService: PgProjectsService,
    private mqttService: MqttService,
    private dialog: MatDialog,
    private loaderService: LoaderService,
    private filterService: MatTableFilterService,
    private commonService: CommonService,
  ) {
    this.dataSource = new MatTableDataSource();
    this.filter = this.filterService.createFilter(this.dataSource);

    contraventionService.columnSubject.subscribe(
      (columns: any) => {
         this.tableFields = columns.filter(field => field.isShow);
         this.setDisplayedColumns(this.tableFields);
    });

    contraventionService.closeSubject.subscribe( res => {
      this.isDetailOn = false;
    });
  }
  ngAfterViewInit() {
    this.setDataSourceAttributes();
  }
  async ngOnInit() {
    Object.values(this.mqttTopics).forEach(topic => {
      this.mqttService.observe(topic)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((message) => this.handleLiveUpdate(topic, message))
      ;
    });

    try {
      this.loaderService.enable();
      this.displayedColumns.forEach(field => {
        this.showFields.push(
          {
            name: field.name,
            label: field.label,
            isShow: field.isShow,
          }
        );
      });
      this.tableFields = this.showFields.filter(field => field.isShow);

      this.projects = await this.projectService.getAllUserProjects().toPromise();
      const statusCodes = await this.contraventionService.getStatusCodes();
      statusCodes.forEach(item => this.statusCodes[item.status_code] = item.status_name);

      this.initForm();
      this.onSubmit();

      this.setDisplayedColumns(this.tableFields);
    } finally {
      this.loaderService.disable();
    }
  }

  initForm() {
    this.crmForm = new FormGroup({
      project: new FormControl('all'),
      from: new FormControl(this.from),
      to: new FormControl(this.to),
    });
  }

  async onSubmit() {
    const from = this.convertToISOString(this.crmForm.value.from, false);
    const to = this.convertToISOString(this.crmForm.value.to, true);
    const params = { from, to };
    if (this.crmForm.value.project !== 'all') {
      params['project_id'] = this.crmForm.value.project;
    }

    try {
      this.loaderService.enable();
      this.isLoading = true;
      this.contraventions = await this.contraventionService.getByFields(params);
      this.dataSource = new MatTableDataSource<Contravention>(this.contraventions);
      this.filter = this.filterService.createFilter(this.dataSource);
      this.cnList = this.contraventions;
      this.fetchMatTable(this.contraventions);
      this.setDataSourceAttributes();
      this.isLoading = false;
      this.refreshCount = this.refreshCount + 1;
    } catch (e) {
      console.log('ContraventionComponent->onSubmit->error', e);
    } finally {
      this.loaderService.disable();
    }
  }

  private convertToISOString(date: Date, byEndOfDay: boolean): string {
    if (byEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.toISOString();
  }

  fetchMatTable(contraventions: Contravention[]): void {
    this.contraventionsOrigin = contraventions;
    this.applyFilter(this.filterValue);
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
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showFields = result;
        this.tableFields = this.showFields.filter(field => field.isShow);
      }
    });
  }

  applyFilter(filterValue: string) {
    this.filter.applySimpleFilter(filterValue, this.tableFields.map(f => f.name));
  }

  private handleLiveUpdate(topic, message) {
    const jsonMessage = JSON.parse(message.payload.toString());
    switch (topic) {
      case this.mqttTopics.cancel:
        this.handleContraventionCancel(jsonMessage);
        break;
      case this.mqttTopics.create:
        this.handleContraventionCreate(jsonMessage);
        break;
      case this.mqttTopics.update:
        this.handleContraventionUpdate(jsonMessage);
        break;
    }
  }

  private handleContraventionCancel(message) {
    const index = this.contraventions.findIndex(contravention => contravention.cn_number_offline === message.cn_number_offline);
    if (index > -1) {
      this.updateObjectDetails(this.contraventions[index], message);
    }
  }

  private handleContraventionCreate(message) {
    const createdAt = new Date(message.creation);
    const from = this.convertToISOString(this.crmForm.value.from, false);
    const to = this.convertToISOString(this.crmForm.value.to, true);
    const selectedProject = this.crmForm.value.project;
    if (new Date(from) <= createdAt && new Date(to) >= createdAt && (selectedProject === 'all' || selectedProject === message.project_id)) {
      this.contraventions.unshift(message);
      this.fetchMatTable(this.contraventions);
    }
  }

  private handleContraventionUpdate(message) {
    const index = this.contraventions.findIndex(contravention => contravention.cn_number_offline === message.cn_number_offline);
    if (index > -1) {
      this.updateObjectDetails(this.contraventions[index], message);
    }
  }

  updateObjectDetails(source, updated) {
    Object.keys(updated).forEach((field) => {
      if (source.hasOwnProperty(field) && source[field] !== updated[field]) {
        source[field] = updated[field];
      }
    });
  }

  setDisplayedColumns(columns) {
    this.displayedColumns1 = [];
    columns.forEach(( colunm, index) => {
      colunm.index = index;
      if (colunm.isShow)
        this.displayedColumns1[index] = colunm.name;
    });
  }

  dragStarted(event: CdkDragStart, index: number ) {
    this.previousIndex = index;
  }

  dropListDropped(event: CdkDropList, index: number) {
    if (event) {
      moveItemInArray(this.tableFields, this.previousIndex, index);
      this.setDisplayedColumns(this.tableFields);
    }
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.contraventionService.contextMenu(event);
  }

  setCategoryClass(cn) {
    const status = cn.status;
    const is_paid = cn.is_paid;
    const canceled = cn.canceled_by;
    const creation = cn.creation;
    const envolved_into_cn = cn.envolved_into_cn;
    const observation_time = cn.observation_time;
    const now = new Date().getTime();
    const created_at = new Date( creation ).getTime();
    const diff = now - created_at;
    const min = Math.floor(diff / 1000 / 60);

    let category = '';
    switch (status) {
      // Observation
      case '0':
        if( canceled !== null ) {
          category = 'observation-canceled';
        } else {
          if ( envolved_into_cn === null && min > observation_time ) {
              category = 'observation-ready-to-use';
          } else {
            category = 'observation-in-progress';
          }
        }

        break;
      // contravention
      case '1':
        if (is_paid) {
          category = 'contravention-paid';
        } else {
          category = 'contravention-status';
        }

        break;
      // Canceled Observation
      case '2':
        category = 'observation-canceled';
        break;
      // Observation Contravention
      case '3':
        category = 'contravention-observation';
        break;
      // Canceled Contravention
      case '4':
        category = 'contravention-canceled';
        break;
    }
    return category;
  }

  onRowSelect(row) {
    this.selectedRowIndex = row.cn_number;
    this.isDetailOn = true;
    this.selectedContravention = row;

    this.contraventionService.selectRow(row);
  }

  handlePage(pageNumber) {
    const end = (pageNumber + 1) * this.pageSize;
    const start = pageNumber * this.pageSize;
    const part = this.cnList.slice(start, end);
    this.dataSource._updateChangeSubscription();
  }

  refreshPage(event) {
    this.pageSize = event.pageSize;
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setStatusLabel(cn) {
    const status = cn.status;
    const is_paid = cn.is_paid;
    const canceled = cn.canceled_by;
    const creation = cn.creation;
    const envolved_into_cn = cn.envolved_into_cn;
    const observation_time = cn.observation_time;
    const now = new Date().getTime();
    const created_at = new Date( creation ).getTime();
    const diff = now - created_at;
    const min = Math.floor(diff / 1000 / 60);

    let category = '';
    switch (status) {
      // Observation
      case '0':
        if( canceled !== null ) {
          category = 'Observation Canceled';
        } else {
          if ( envolved_into_cn === null && min > observation_time ) {
              category = 'Observation Ready To Use';
          } else {
            category = 'Observation In Progress';
          }
        }

        break;
      // contravention
      case '1':
        if (is_paid) {
          category = 'Contravention Paid';
        } else {
          category = 'Contravention Status';
        }

        break;
      // Canceled Observation
      case '2':
        category = 'Observation Canceled';
        break;
      // Observation Contravention
      case '3':
        category = 'Contravention Observation';
        break;
      // Canceled Contravention
      case '4':
        category = 'Contravention Canceled';
        break;
    }
    return category;
  }

  formatTimeWithGmt = (datetime, gmt) => {
    return this.commonService.formatTimeWithGmt(datetime, gmt);
  }
}
