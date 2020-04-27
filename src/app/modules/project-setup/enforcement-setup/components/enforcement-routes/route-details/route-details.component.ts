import {Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges, Inject} from '@angular/core';
import { ProjectRoute } from '../../../../../../components/enforcement/models/project-route.model';
import { MatSort, MatTableDataSource, MatDialog, MatPaginator } from '@angular/material';
import { Employee } from '../../../../../../shared/classes/employee';
import { ToastrService } from 'ngx-toastr';
import { RouteStaffComponent } from '../route-staff/route-staff.component';
import { PgProjectRouteService } from '../../../../../../components/enforcement/services/project-route.service';
import { LoaderService } from '../../../../../../services/loader.service';
import { EmployeeInfoComponent } from 'app/components/employees/employee-info/employee-info.component';
import { AlertdialogComponent } from '../../../../../../components/alertdialog/alertdialog.component';
import {TableColumnsEditModalComponent} from '../../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-route-details',
  templateUrl: './route-details.component.html',
  styleUrls: ['./route-details.component.scss']
})
export class RouteDetailsComponent implements OnInit, OnChanges {
  @Input() routeId: number;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  employees: Employee[];
  employeesOrigin: Employee[];
  tableFields = [];
  showFields = [];
  displayedColumns = [
    {name: 'avatar', label: 'Avatar', isShow: true},
    {name: 'firstname', label: 'Firstname', isShow: true},
    {name: 'lastname', label: 'Lastname', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];
  baseUrl: string = this.apiEndpoint + '/';
  route: ProjectRoute;

  constructor(
    private readonly routeService: PgProjectRouteService,
    private readonly dialog: MatDialog,
    private readonly toastrService: ToastrService,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    private loaderService: LoaderService,
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
    if (changes.routeId) {
      this.getDetails();
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

  private async getDetails() {
    try {
      this.loaderService.enable();
      const route = await this.routeService.getOne(this.routeId).toPromise();
      route['waypoints'] = JSON.parse(route.connecting_points).waypoints;
      this.route = {...route};
      this.fetchMatTable(this.route.staffs);
    } finally {
      this.loaderService.disable();
    }
  }

  private fetchMatTable(employees: Employee[]): void {
    this.employees = employees;
    this.employeesOrigin = employees;
  }

  public onAdd() {
    const dialogRef = this.dialog.open(RouteStaffComponent, {
      width: '80%',
      data: {projectId: this.route.project_id, employees: this.route.staffs}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.route.staffs = result as Employee[];
        const route = new ProjectRoute();
        route.id = this.route.id;
        route.staffs = this.route.staffs .map(employee => employee.employee_id);
        this.routeService.update(route).subscribe( res => {
          this.toastrService.success('The employees are added successfully!', 'Success!');
          this.fetchMatTable(this.route.staffs);
        });
      }
    });
  }

  applyFilterStaff(filterValue) {
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
  }

  public onSelectEmployee(event: any) {
    if (event.type === 'click') {
      event.rowElement.className = event.rowElement.className + ' selectedRow';
      const dialogRef = this.dialog.open(EmployeeInfoComponent, {
        width: '90%',
        data: {employee: event.row}
      });
      dialogRef.afterClosed().subscribe(result => {
        $('.datatable-body-row.selectedRow').removeClass('selectedRow');
        if (result) {
        }
      });
    }
  }

  onDeleteEmployee(selectedEmployee: Employee) {
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
          const index = this.route.staffs.indexOf(selectedEmployee);
          this.route.staffs.splice(index, 1);

          const route = new ProjectRoute();
          route.id = this.route.id;
          route.staffs = this.route.staffs.map(employee => employee.employee_id);
          await this.routeService.update(route).toPromise();
          this.toastrService.success('The employee is unassigned successfully!', 'Success!');
          this.fetchMatTable(this.route.staffs);
        } catch (e) {
          this.toastrService.error(e.message ? e.message : 'Something went wrong', 'Error!');
        } finally {
          this.loaderService.disable();
        }
      }
    });
  }
}
