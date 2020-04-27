import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {MatSort, MatPaginator, MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import { Employee } from '../../../../../../components/employees/models/employee.model';
import { PgEmployeeService } from '../../../../../../components/employees/employee.service';
import { EmployeeTypesForRoutes } from '../../../models/enforcement.model';
import {TableColumnsEditModalComponent} from '../../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-route-staff',
  templateUrl: './route-staff.component.html',
  styleUrls: ['./route-staff.component.scss']
})
export class RouteStaffComponent implements OnInit {

  employees: Employee[];
  employeesOrigin: Employee[];
  allChecked: boolean;
  baseUrl: string = this.apiEndpoint + '/';

  displayedColumns = [
    {name: 'checkbox', label: 'Selection', isShow: true},
    {name: 'avatar', label: 'Picture', isShow: true},
    {name: 'firstname', label: 'First name', isShow: true},
    {name: 'lastname', label: 'Last name', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
    {name: 'projects', label: 'Project', isShow: true},
    {name: 'phone_number', label: 'Mobile', isShow: true},
    {name: 'status', label: 'Status', isShow: true},
  ];
  tableFields = [];
  showFields = [];

  selectedCount = 0;
  projectId: number;

  constructor(
    public dialogRef: MatDialogRef<RouteStaffComponent>,
    private readonly employeeService: PgEmployeeService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
  ) {
    this.projectId = data.projectId;
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
    const selectedEmployees = [];

    this.data.employees.forEach( element => {
      if( element.employee_id ){
        selectedEmployees.push(element.employee_id);
      } else {
        selectedEmployees.push(element);
      }
    });

    this.employeeService.getWithProjectName({project_id: this.projectId}).subscribe(employees => {
      this.employees = employees.filter(employee => EmployeeTypesForRoutes.includes(employee.job_type))
        .map(employee => {
          return {
            ...employee,
            checked: !!selectedEmployees.find(v => v == employee.employee_id )
          };
        })
      ;
      this.employeesOrigin = this.employees;
      this.selectedCount = this.employees.filter(e => e['checked']).length;
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
