import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, Inject } from '@angular/core';
import { PgEmployeeWpService } from '../../../employees/employee-wp.service';
import { MatSort, MatPaginator, MatTableDataSource, MatDialog } from '@angular/material';
import { Employee, EmployeeWp } from '../../../employees/models/employee.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertdialogComponent } from '../../../alertdialog/alertdialog.component';
import { EmployeeInfoComponent } from 'app/components/employees/employee-info/employee-info.component';
import { TableColumnsEditModalComponent } from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-assigned-employees-list',
  templateUrl: './assigned-employees-list.component.html',
  styleUrls: ['./assigned-employees-list.component.scss']
})

export class AssignedEmployeesListComponent implements OnInit, OnChanges {
  @Input() workplan_name: string;
  @Input() canUpdate: boolean;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  baseUrl: string = this.apiEndpoint + '/';
  employees: Employee[];
  dataSource: MatTableDataSource<Employee> = new MatTableDataSource();

  showFields = [];
  tableFields = [];
  isLoading = false;
  displayedColumns = [
    {name: 'avatar', label: 'Avatar', isShow: true},
    {name: 'firstname', label: 'Firstname', isShow: true},
    {name: 'lastname', label: 'Lastname', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
    {name: 'projects', label: 'Projects', isShow: true},
    {name: 'phone_number', label: 'Mobile', isShow: true},
    {name: 'status', label: 'Status', isShow: true}
  ];

  constructor(
    private readonly employeewpService: PgEmployeeWpService,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private dialog: MatDialog,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {}

  ngOnInit( ) {
    if (this.canUpdate) {
      this.displayedColumns.push({name: 'action', label: 'Action', isShow: true });
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

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.workplan_name &&
      this.workplan_name &&
      this.workplan_name.length
    ) {
      this.getEmployees();
    }

    if (changes.canUpdate && this.canUpdate && this.displayedColumns.indexOf({name: 'action', label: 'Action', isShow: true}) === -1) {
      this.displayedColumns.push({name: 'action', label: 'Action', isShow: true});
      this.showFields = [];
      this.tableFields = [];
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
  }

  private getEmployees(): void {
    this.employeewpService
      .getEmployees({wp_name: this.workplan_name})
      .subscribe(res => {
        this.employees = res;
      });
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

  public onDelete(employee_wp: EmployeeWp): void {
    if (!this.canUpdate) {
      return;
    }
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete?',
        btnOk: 'Ok',
        btnCancel: 'Cancel',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employeewpService.deleteByEmployeeId(employee_wp.employee_id).subscribe(res => {
          this.toastr.success(
            'The employee is deleted successfully!',
            'Success!'
          );
          this.getEmployees();
        });
      }
    });
  }

  public AddEmployee() {
    this.router.navigate([
      'workplans/assigned',
      {name: this.workplan_name, retUrl: 'details'}
    ]);
  }

  onSelect(event: any) {
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