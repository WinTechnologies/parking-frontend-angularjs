import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material';
import { PgEmployeeService } from '../../../employees/employee.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Employee, EmployeeWp } from '../../../employees/models/employee.model';
import { forkJoin } from 'rxjs';
import { PgEmployeeWpService } from '../../../employees/employee-wp.service';
import { PgWorkplanService } from '../../workplan.service';
import { Workplan } from '../../models/workplan.model';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { TableColumnsEditModalComponent } from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-assigned-employee-new',
  templateUrl: './assigned-employee-new.component.html',
  styleUrls: ['./assigned-employee-new.component.scss']
})

export class AssignedEmployeeNewComponent implements OnInit {
  employees: Employee[];
  employeesOrigin: Employee[];
  allChecked: boolean;
  workplan_name: string;
  selectedCount = 0;
  workplan: Workplan;

  displayedColumns = [
    {name: 'checkbox', label: 'Selection', isShow: true},
    {name: 'avatar', label: 'Picture', isShow: true},
    {name: 'firstname', label: 'First name', isShow: true},
    {name: 'lastname', label: 'Last name', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
    {name: 'projects', label: 'Projects', isShow: true},
    {name: 'workplan', label: 'Workplan', isShow: true},
    {name: 'type', label: 'User Type', isShow: true},
    {name: 'phone_number', label: 'Mobile #', isShow: true},
    {name: 'status', label: 'Status', isShow: true}
  ];
  tableFields = [];
  showFields = [];
  baseUrl: string = this.apiEndpoint + '/';

  returnUrl: string;
  constructor(
    private readonly employeeService: PgEmployeeService,
    private readonly employeewpService: PgEmployeeWpService,
    private readonly workplanService: PgWorkplanService,
    private readonly router: Router,
    private route: ActivatedRoute,
    private readonly toastr: ToastrService,
    private location: Location,
    private dialog: MatDialog,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
    this.route.params.subscribe(params => {
      if (params['name']) {
        this.workplan_name = params['name'];
      }
      if (params['retUrl']) {
        this.returnUrl = params['retUrl'];
      }
    });
  }

  ngOnInit() {
    this.getEmployees();
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

  private getEmployees(): void {
    forkJoin(
      this.employeewpService.getUnassingedEmployees(),
      this.workplanService.get({wp_name: this.workplan_name})
    ).subscribe(res => {
      if (res[1].length) {
        this.workplan = res[1][0];
      }

      this.employees = res[0];
      this.employees.forEach(employee => {
        employee['checked'] = false;
      });
      this.employeesOrigin = this.employees;
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

  public onBack() {
    this.location.back();
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
    this.location.back();
  }

  public onAssigned() {
    const filteredEmployee = this.employees.filter(e => e['checked']);
    if (this.workplan && filteredEmployee.length) {
      const data = [];
      filteredEmployee.forEach( employee => {
        const employeewp = new EmployeeWp();
        employeewp.employee_id = employee.employee_id;
        employeewp.workplan_id = this.workplan.id;
        employeewp.wp_reoccuring_id = '{' + this.workplan.reoccurings.map(v => v.id).join(',') + '}';
        employeewp.wp_exception_id = '{' + this.workplan.exceptions.map(v => v.id).join(',') + '}';
        data.push(employeewp);
      });
      this.employeewpService.create(data).subscribe(res => {
          this.toastr.success('The employee is assigned successfully!', 'Success!');
          if (this.returnUrl) {
            this.location.back();
          } else {
            this.router.navigate(['workplans/details', {name: this.workplan_name}]);
          }
      });
    }
  }
}