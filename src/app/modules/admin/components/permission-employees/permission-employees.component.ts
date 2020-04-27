import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Employee } from '../../../../components/employees/models/employee.model';
import { EmployeeInfoComponent } from 'app/components/employees/employee-info/employee-info.component';
import { environment } from '../../../../../environments/environment';
import { TableColumnsEditModalComponent } from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-permission-employees',
  templateUrl: './permission-employees.component.html',
  styleUrls: ['./permission-employees.component.scss']
})

export class PermissionEmployeesComponent implements OnInit, OnChanges {
  @Input() employees: Employee[] = [];
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

  baseUrl = environment.baseAssetsUrl;

  constructor(
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.fetchMatTable(this.employees);
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['employees'] && !changes['employees'].isFirstChange()) {
      setTimeout(() => {
        this.fetchMatTable(this.employees);
      });
    }
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

  fetchMatTable(employees: Employee[]): void {
    this.employeeOriginal = employees;
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
      this.employees = this.employeeOriginal.filter(row => {
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

  getResultValue() {
    switch (this.employees.length) {
      case 0:
        return 'No Employees';
      case 1:
        return '1 User';
      default:
        return `${this.employees.length} users`;
    }
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