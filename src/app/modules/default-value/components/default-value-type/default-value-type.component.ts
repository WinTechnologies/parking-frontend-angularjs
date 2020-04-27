import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CurrentUserService } from '../../../../services/current-user.service';
import { Location } from '@angular/common';
import { LoaderService } from '../../../../services/loader.service';
import { DefaultValueType, DefaultValueList, defaultValueTypes } from '../../default-value.fixtures';
import { MatDialog } from '@angular/material';
import { DefaultValueDetailModalComponent } from '../default-value-detail-modal/default-value-detail-modal.component';
import { AlertdialogComponent } from '../../../../components/alertdialog/alertdialog.component';
import { DefaultValueService } from '../../services/default-value.service';
import { config } from '../../../../../config';
import { ToastrService } from 'ngx-toastr';
import {TableColumnsEditModalComponent} from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';
import { PgEmployeeService } from '../../../../components/employees/employee.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {MqttService} from 'ngx-mqtt';

@Component({
  selector: 'app-default-value-type',
  templateUrl: './default-value-type.component.html',
  styleUrls: ['./default-value-type.component.scss']
})
export class DefaultValueTypeComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();

  isLoading = false;
  filterValue = '';

  currentType: DefaultValueType;
  defaultValueTypes: DefaultValueType[] = defaultValueTypes;

  defaultValues: any[] =  [];
  defaultValuesOrigin: any[] =  [];

  // Permission Feature
  currentUser: any;
  allEmployees: any[];
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false
  };
  mqttTopics = config.mqttTopics.defaultValue;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private defaultValueService: DefaultValueService,
    private toastrService: ToastrService,
    private employeeService: PgEmployeeService,
    private mqttService: MqttService,
    @Inject('API_ENDPOINT') public apiEndpoint: string
  ) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async ngOnInit() {
    Object.values(this.mqttTopics).forEach(topic => {
      this.mqttService.observe(topic)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((message) => this.handleLiveUpdate(topic, message))
      ;
    });

    this.route.params.subscribe((params: Params) => {
      const typeName = params['type'];
      if (typeName) {
        this.currentType = this.defaultValueTypes.find(defaultValueType => defaultValueType.name === typeName);
      }
    });

    try {
      this.loaderService.enable();
      this.currentUser = await this.currentUserService.get();
      this.employeeService.get().pipe(takeUntil(this.ngUnsubscribe)).subscribe(employees => {
        this.allEmployees = employees;
      });
      this.permission = CurrentUserService.canFeature(this.currentUser, 'setting_default_value');

      this.currentType.lists = this.currentType.lists.map(list => {
        list.showFields = list.tableFields;
        list.tableFields = list.showFields.filter(field => field.isShow);
        return list;
      });

      if (this.currentType) {
        await this.getDefaultValues();
      }
    } finally {
      this.loaderService.disable();
    }
  }

  private handleLiveUpdate(topic, message) {
    const jsonMessage = JSON.parse(message.payload.toString());
    switch (topic) {
      case this.mqttTopics.remove:
        this.handleDefaultValueRemove(jsonMessage);
        break;
      case this.mqttTopics.create:
        this.handleDefaultValueCreate(jsonMessage);
        break;
      case this.mqttTopics.update:
        this.handleDefaultValueUpdate(jsonMessage);
        break;
    }
  }

  private handleDefaultValueRemove(message) {
    this.currentType.lists.forEach((list, listIndex) => {
      if (list.apiEndpoint === message.apiEndpoint) {
        const index = this.defaultValuesOrigin[listIndex].findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.defaultValuesOrigin[listIndex].splice(index, 1);
        }
      }
    });
    this.fetchMatTable(this.defaultValuesOrigin);
  }

  private handleDefaultValueCreate(message) {
    this.currentType.lists.forEach((list, listIndex) => {
      if (list.apiEndpoint === message.apiEndpoint && message.id) {
        this.defaultValuesOrigin[listIndex].unshift(message);
      }
    });
    this.fetchMatTable(this.defaultValuesOrigin);
  }

  private handleDefaultValueUpdate(message) {
    this.currentType.lists.forEach((list, listIndex) => {
      if (list.apiEndpoint === message.apiEndpoint) {
        const index = this.defaultValuesOrigin[listIndex].findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.updateObjectDetails(this.defaultValuesOrigin[listIndex][index], message);
        }
      }
    });
    this.fetchMatTable(this.defaultValuesOrigin);
  }

  updateObjectDetails(source, updated) {
    Object.keys(updated).forEach((field) => {
      if (source.hasOwnProperty(field) && source[field] !== updated[field]) {
        source[field] = updated[field];
      }
    });
  }

  public getUserName(id: string): string {
    if (id === this.currentUser.employee_id) {
      return `${this.currentUser.firstname} ${this.currentUser.lastname}`;
    } else if (id) {
      return this.allEmployees.filter(employee => employee.employee_id === id).map(user => `${user.firstname} ${user.lastname}`)[0];
    } else {
      return '';
    }
  }

  private async getDefaultValues() {
    this.defaultValues = await Promise.all(
      this.currentType.lists.map(list => this.defaultValueService.getDefaultValues(list.apiEndpoint))
    );
    this.defaultValuesOrigin = [...this.defaultValues];
    this.fetchMatTable(this.defaultValues);
  }

  fetchMatTable(codes: any[]): void {
    this.currentType.lists.map((list, listIndex) => this.applyFilterTable(this.filterValue, listIndex));
  }

  public editColumns(listIndex: number) {
    const { showFields, tableFields } = this.currentType.lists[listIndex];
    const dialogRef = this.dialog.open(TableColumnsEditModalComponent, {
      width: '550px',
      data : {
        showFields: showFields,
        originFields: tableFields,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentType.lists[listIndex].showFields = result;
        this.currentType.lists[listIndex].tableFields = this.currentType.lists[listIndex].showFields.filter(field => field.isShow);
      }
    });
  }

  public reorderColumns(event, listIndex: number) {
    const { showFields, tableFields } = this.currentType.lists[listIndex];

    const newValue = tableFields[event.newValue];
    const prevValue = tableFields[event.prevValue];
    const newIndex = showFields.indexOf(newValue);
    const prevIndex = showFields.indexOf(prevValue);
    let i = 0 ;
    this.currentType.lists[listIndex].showFields = showFields.map(value => {
      value = i === newIndex ? prevValue : value;
      value = i === prevIndex ? newValue : value;
      i++;
      return value;
    });
    this.currentType.lists[listIndex].tableFields = showFields.filter(field => field.isShow);
  }

  applyFilterTable(filterValue: string, listIndex: number) {
    this.filterValue = filterValue;
    this.filterTable(filterValue, listIndex);
  }

  filterTable(filterValue: string, listIndex: number) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    const { showFields } = this.currentType.lists[listIndex];
    if (this.defaultValuesOrigin && this.defaultValuesOrigin[listIndex]) {
      this.defaultValues[listIndex] = this.defaultValuesOrigin[listIndex].filter(row => {
        let bRet = true;
        if (filterValue && showFields) {
          let cRet = false;
          showFields.forEach(value => {
            if (row[value.name]) {
              cRet = cRet || (row[value.name].toString().toLowerCase().indexOf(filterValue) >= 0);
            }
          });
          bRet = cRet;
        }
        return bRet;
      });
      if (!this.defaultValues[listIndex].length) {
        this.defaultValues[listIndex] = this.defaultValuesOrigin[listIndex];
      }
    }
  }

  goBack() {
    this.location.back();
  }

  onEdit(event, listIndex: number) {
    if (event.type === 'click' && this.currentType.lists[listIndex].name !== 'Job Type') {
      const list = this.currentType.lists[listIndex];
      const data = {
        defaultValue: event.row,
        list: list,
        isCreate: false,
        availableJobTypes: this.getAllJobTypes(),
      };
      event.rowElement.className = event.rowElement.className + ' selectedRow';
      const dialogRef = this.dialog.open(DefaultValueDetailModalComponent, {
        width: '760px',
        data
      });
      dialogRef.afterClosed().subscribe(result => {
        $('.datatable-body-row.selectedRow').removeClass('selectedRow');
        if (result) {
          this.getDefaultValues();
        }
      });
    }
  }

  onAdd(listIndex: number) {
    const data = this.makeNewDetailModalData(listIndex);
    const dialogRef = this.dialog.open(DefaultValueDetailModalComponent, {
      width: '760px',
      data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getDefaultValues();
      }
    });
  }

  onDelete(defaultValue, listIndex: number) {
    const list = this.currentType.lists[listIndex];
    if (list.name !== 'Job Type') {
      const dialogRef = this.dialog.open(AlertdialogComponent, {
        data: {
          title: 'Confirm',
          message: 'This action is not reversible! Are you sure you want to delete?',
          btnOk: 'Ok',
          btnCancel: 'Cancel'
        }
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          try {
            this.loaderService.enable();
            await this.defaultValueService.deleteDefaultValue(list.apiEndpoint, defaultValue.id);
            await this.getDefaultValues();
            this.toastrService.success('The default value is deleted successfully!', 'Success!');
          } catch (e) {
            this.toastrService.error(e.message ? e.message : 'Something went wrong', 'Error');
          } finally {
            this.loaderService.disable();
          }
        }
      });
    }
  }

  isImagePreviewShown(rowValue, isImgTag = true): boolean {
    if (isImgTag) {
      return rowValue && !rowValue.endsWith('.xml');
    } else {
      return rowValue && rowValue.endsWith('.xml');
    }
  }

  defineUrl(rowValue): string {
    if (rowValue && (rowValue.startsWith('uploads') || rowValue.startsWith('resource'))) {
      return `${this.apiEndpoint}/${rowValue}`;
    } else if (rowValue.startsWith('/incident')) {
      return `${this.apiEndpoint}/resource/images${rowValue}`;
    } else {
      return rowValue;
    }
  }

  private makeNewDetailModalData(listIndex: number) {
    const list = this.currentType.lists[listIndex];
    const data = {
      defaultValue: {},
      list: list,
      isCreate: true,
      availableJobTypes: [],
      employeeId: this.currentUser.employee_id
    };
    switch (list.name) {
      case 'department':
        data.defaultValue['department_code'] = this.makeNewDefaultValueCode('department_code', listIndex);
        break;
      case 'position':
        data.defaultValue['code'] = this.makeNewDefaultValueCode('code', listIndex);
        data.availableJobTypes = this.getAllJobTypes();
        break;
      case 'Job Type':
        data.defaultValue['code'] = this.makeNewDefaultValueCode('code', listIndex);
        break;
      case 'city':
        data.defaultValue['city_code'] = this.makeNewDefaultValueCode('city_code', listIndex);
        break;
      case 'vat':
        data.defaultValue['vat_code'] = this.makeNewDefaultValueCode('vat_code', listIndex);
        break;
    }
    return data;
  }

  private makeNewDefaultValueCode(field, listIndex: number) {
    let lastValue;
    if ( field === 'city_code')   {
      lastValue = Math.max(...this.defaultValues[listIndex].map(value => parseInt(value.id, 10)));
      if (lastValue === Infinity) {
        lastValue = 0;
      }
    } else {
      lastValue = Math.max(...this.defaultValues[listIndex].map(value => parseInt(value[field], 10)));
    }
    const code = `${lastValue + 1}`;

    return code.padStart(config.codeBaseDigits, '0');
  }

  /**
   * This is only for New/Edit popup of Position Default Value
   */
  private getAllJobTypes() {
    // index of Job Type List
    const index = this.currentType.lists.findIndex(list => list.name === 'Job Type');
    if (index !== -1) {
      return this.defaultValuesOrigin[index];
    } else {
      return [];
    }
  }
}
