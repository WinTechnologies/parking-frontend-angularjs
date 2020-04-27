import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Employee } from '../../../../../components/employees/models/employee.model';
import { PgEmployeeService } from '../../../../../components/employees/employee.service';
import { PermissionEmployeesModalService } from '../../../services/permission-employees-modal.service';
import { EmployeePermissionService } from '../../../services/employee-permission.service';
import { LoaderService } from '../../../../../services/loader.service';
import { PermissionTemplateService } from '../../../services/permission-template.service';
import { PermissionTemplate } from '../../../models/permission-template.model';
import { EmployeeInfoComponent } from 'app/components/employees/employee-info/employee-info.component';
import { environment } from '../../../../../../environments/environment';
import { TableColumnsEditModalComponent } from '../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-permission-assigned-employees',
  templateUrl: './permission-assigned-employees.component.html',
  styleUrls: ['./permission-assigned-employees.component.scss']
})

export class PermissionAssignedEmployeesComponent implements OnInit {
  @Input() permissionTemplateId: number;
  @Input() canUpdate = false;

  showFields = [];
  tableFields = [];
  isLoading = false;
  filterValue = '';

  employeeOriginal: Employee[];
  displayedColumns = [
    {name: 'avatar', label: 'Avatar', isShow: true},
    {name: 'firstname', label: 'Firstname', isShow: true},
    {name: 'lastname', label: 'Lastname', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
    {name: 'phone_number', label: 'Mobile', isShow: true},
    {name: 'status', label: 'Status', isShow: true}
  ];

  allEmployees: Employee[];
  assignedEmployees: Employee[];
  template: PermissionTemplate;

  baseUrl = environment.baseAssetsUrl;

  constructor(
    private employeeService: PgEmployeeService,
    private permissionEmployeesModalService: PermissionEmployeesModalService,
    private permissionTemplateService: PermissionTemplateService,
    private employeePermissionService: EmployeePermissionService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.initData();
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

  async initData() {
    try {
      this.loaderService.enable();
      const promises = [
        this.employeeService.get().toPromise(),
        this.employeePermissionService.getAll({
          permission_template_id: this.permissionTemplateId
        }),
        this.permissionTemplateService.getTemplate(this.permissionTemplateId)
      ];
      [this.allEmployees, this.assignedEmployees, this.template] = await Promise.all(promises);
      this.fetchMatTable(this.assignedEmployees);
    } finally {
      this.loaderService.disable();
    }
  }

  fetchMatTable(employees: Employee[]): void {
    this.employeeOriginal = employees;
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

  public applyFilterEmployee(filterValue: string) {
    this.filterValue = filterValue;
    this.filterTable();
  }

  filterTable() {
    let filterValue = this.filterValue;
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.employeeOriginal) {
      this.assignedEmployees = this.employeeOriginal.filter(row => {
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
  }

  showEmployeesModal() {
    const employeesModalRef = this.permissionEmployeesModalService.show({
      allEmployees: this.allEmployees,
      assignedEmployees: this.assignedEmployees,
      template: this.template
    });
    employeesModalRef.afterClosed()
      .subscribe((result) => {
        if (result) {
          this.initData();
        }
      });
  }

  public onSelect(event: any) {
    if (event.type === 'click') {
      event.rowElement.className = event.rowElement.className + ' selectedRow';
      const dialogRef = this.dialog.open(EmployeeInfoComponent, {
        width: '90%',
        data: {employee: event.row}
      });
      dialogRef.afterClosed().subscribe(result => {
        $('.datatable-body-row.selectedRow').removeClass('selectedRow');
      });
    }
  }
}