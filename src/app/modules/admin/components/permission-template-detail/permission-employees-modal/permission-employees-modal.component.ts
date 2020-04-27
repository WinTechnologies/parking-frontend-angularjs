import { AfterContentChecked, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Employee } from '../../../../../components/employees/models/employee.model';
import { PgEmployeeService } from '../../../../../components/employees/employee.service';
import { ToastrService } from 'ngx-toastr';
import { EmployeePermissionService } from '../../../services/employee-permission.service';
import { LoaderService } from '../../../../../services/loader.service';
import { environment } from '../../../../../../environments/environment';
import { TableColumnsEditModalComponent } from '../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-permission-employees-modal',
  templateUrl: './permission-employees-modal.component.html',
  styleUrls: ['./permission-employees-modal.component.scss']
})

export class PermissionEmployeesModalComponent implements OnInit, AfterContentChecked {
  allChecked: boolean;
  selectedCount = 0;
  allEmployeesWithChecked: any[] = [];
  employeesOrigin: any[] = [];
  assignedEmployees: Employee[];
  employeesToAssign = {
    create: [],
    update: [],
    delete: []
  };

  filterValue = '';

  displayedColumns = [
    {name: 'checkbox', label: 'Selection', isShow: true},
    {name: 'avatar', label: 'Picture', isShow: true},
    {name: 'firstname', label: 'First name', isShow: true},
    {name: 'lastname', label: 'Last name', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
    {name: 'phone_number', label: 'Mobile #', isShow: true},
    {name: 'status', label: 'Status', isShow: true},
  ];
  tableFields = [];
  showFields = [];

  baseUrl = environment.baseAssetsUrl;

  constructor(
    private employeeService: PgEmployeeService,
    public dialogRef: MatDialogRef<PermissionEmployeesModalComponent>,
    private employeePermissionService: EmployeePermissionService,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
    private loaderService: LoaderService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.allEmployeesWithChecked = this.matDialogData.allEmployees.map(employee => {
      employee['checked'] = !!this.matDialogData.assignedEmployees.find(assignedEmployee => assignedEmployee.employee_id === employee.employee_id);
      return employee;
    });
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
    this.employeesOrigin = this.allEmployeesWithChecked;
  }

  ngAfterContentChecked(): void {
    this.applyFilterEmployee(this.filterValue);
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
    if (this.employeesOrigin) {
      this.allEmployeesWithChecked = [...this.employeesOrigin.filter(row => {
        let bRet = true;
        let cRet = false;
        this.tableFields.forEach(value => {
          if (row[value.name]) {
            cRet = cRet || (row[value.name].toString().toLowerCase().indexOf(filterValue) >= 0);
          }
        });
        bRet = bRet && cRet;
        return bRet;
      })];
    }
    this.calculateSelectedCount();
  }

  public async onAdd() {
    try {
      const checkedEmployeeIds = this.employeesOrigin
        .filter(employee => employee['checked'])
        .map(employee => {
          return employee.employee_id;
        })
      ;
      if (checkedEmployeeIds.length === 0 ) {
        return false;
      }
      this.loaderService.enable();
      const allEmployeePermissions = await this.employeePermissionService.getAll();
      const allEmployeePermissionIds = allEmployeePermissions.map(item => item.employee_id);
      const assignedEmployeesIds = this.matDialogData.assignedEmployees.map(item => item.employee_id);

      this.employeesToAssign = {
        create: checkedEmployeeIds.filter(employee_id => !allEmployeePermissionIds.includes(employee_id)),
        update: checkedEmployeeIds.filter(employee_id => allEmployeePermissionIds.includes(employee_id)),
        delete: assignedEmployeesIds.filter( (employee_id) => !checkedEmployeeIds.includes(employee_id))
      };

      const promises = [];
      if (this.employeesToAssign.create.length > 0) {
        promises.push(this.employeePermissionService.createBulk(this.employeesToAssign.create, this.matDialogData.template.id));
      }
      if (this.employeesToAssign.update.length > 0) {
        promises.push(this.employeePermissionService.updateBulk(this.employeesToAssign.update, this.matDialogData.template.id));
      }
      if (this.employeesToAssign.delete.length > 0) {
        promises.push(this.employeePermissionService.deleteBulk(this.employeesToAssign.delete));
      }
      await Promise.all([promises]);
      this.toastrService.success('Users are assigned successfully!', 'Success!');
    } finally {
      this.loaderService.disable();
      this.dialogRef.close(true);
    }
  }

  public onCancel() {
    this.dialogRef.close(false);
  }

  public onSelect(event: any) {
    if (event.type === 'click') {
      event.row['checked'] = !event.row['checked'];
      this.calculateSelectedCount();
    }
  }

  checkAll() {
    this.allEmployeesWithChecked.forEach(employee => {
      employee['checked'] = this.allChecked;
    });
    this.calculateSelectedCount();
  }

  public changeCheckItem() {
    this.calculateSelectedCount();
  }

  private calculateSelectedCount() {
    this.selectedCount = this.allEmployeesWithChecked.filter(e => e['checked']).length;
  }
}