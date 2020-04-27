import { Component, OnInit, Inject } from '@angular/core';
import {MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import { Employee } from '../../../../../../components/employees/models/employee.model';
import { PgEmployeeService } from '../../../../../../components/employees/employee.service';
import { forkJoin } from 'rxjs';
import {PgProjectEmployeeService} from '../../../../../../components/projects/services/project-employee.service';
import {environment} from '../../../../../../../environments/environment';
import {TableColumnsEditModalComponent} from '../../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-enforcement-eo-new',
  templateUrl: './enforcement-eo-new.component.html',
  styleUrls: ['./enforcement-eo-new.component.scss']
})
export class EnforcementEoNewComponent implements OnInit {

  employees: Employee[];
  employeesOrigin: Employee[];
  allChecked: boolean;

  displayedColumns = [
    {name: 'checkbox', label: 'Selection', isShow: true},
    {name: 'avatar', label: 'Picture', isShow: true},
    {name: 'firstname', label: 'First name', isShow: true},
    {name: 'lastname', label: 'Last name', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
  ];
  tableFields = [];
  showFields = [];

  selectedCount = 0;
  projectId: number;
  position: string;
  baseUrl = environment.apiBase;

  constructor(
    public dialogRef: MatDialogRef<EnforcementEoNewComponent>,
    private readonly employeeService: PgEmployeeService,
    private readonly projectEmployeeService: PgProjectEmployeeService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.projectId = data.projectId;
    if (data.position === 'EOD') {
      this.position = 'Enforcer-Driver';
    } else {
      this.position = data.position;
    }
  }

  ngOnInit() {
    // Fixed Expression has been changed after checked Error by Settimeout()
    setTimeout(() => this.getEmployees(), 0);
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

  private getEmployees(): void {
    forkJoin(
      this.projectEmployeeService.getEmployeesByProject({project_id: this.projectId, job_type: this.position}),
      // get employee by job_type
      this.employeeService.get({job_type: this.position, working_status: 'Active'})
    ).subscribe(res => {
      const assigned_employee = res[0];
      let employees = res[1];
      employees = employees.filter( employee => {
        return assigned_employee.findIndex( e => e.employee_id === employee.employee_id) < 0;
      });
      this.employees = employees;
      this.employees = this.employees.map(employee => {
        employee['checked'] = false;
        return employee;
      });
      this.employeesOrigin = this.employees;
    });
  }

  private calculateSelectedCount() {
    this.selectedCount = this.employees.filter(e => e['checked']).length;
  }

  public applyFilterEmployee(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.employeesOrigin) {
      this.employees = this.employeesOrigin.filter(row => {
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
    this.employees.forEach(employee => {
      employee['checked'] = this.allChecked;
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
    const filteredEmployee = this.employees.filter(e => e['checked']);
    this.dialogRef.close(filteredEmployee);
  }
}
