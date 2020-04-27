import { Component, OnInit, Input, OnChanges, SimpleChanges, Inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Employee } from '../../../../../../components/employees/models/employee.model';
import { EnforcementEoNewComponent } from '../enforcement-eo-new/enforcement-eo-new.component';
import { ProjectEmployee } from '../../../../../../components/projects/models/project-employee.model';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EnforcementItem, EnforcementType } from '../../../models/enforcement.model';
import { PgProjectEmployeeService } from '../../../../../../components/projects/services/project-employee.service';
import { CurrentUserService } from '../../../../../../services/current-user.service';
import { EmployeeInfoComponent } from 'app/components/employees/employee-info/employee-info.component';
import { AlertdialogComponent } from '../../../../../../components/alertdialog/alertdialog.component';
import { DataGridComponent } from '../../../../../../shared/components/data-grid/data-grid.component';
import { MatTableDefinitionService } from '../../../../../../services/mat-table-definition.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-enforcement-eo-list',
  templateUrl: './enforcement-eo-list.component.html',
  styleUrls: ['./enforcement-eo-list.component.scss']
})
export class EnforcementEoListComponent implements OnInit, OnChanges {
  @Input() projectId: number;
  @Input() enforcementItem: EnforcementItem;

  @ViewChild(DataGridComponent) dataGrid;

  tableName = 'eo';

  showFields = [];
  isLoading = false;

  job_type: string;
  employees: Employee[];
  displayedColumns = [
    {name: 'avatar', label: 'Avatar', isShow: true},
    {name: 'firstname', label: 'Firstname', isShow: true},
    {name: 'lastname', label: 'Lastname', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
    // {name: 'projects', label: 'Projects', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];
  baseUrl = this.apiEndPoint + '/';

  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  constructor(
    private readonly projectEmployeeService: PgProjectEmployeeService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private currentUserService: CurrentUserService,
    @Inject('API_ENDPOINT') private apiEndPoint,
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.projectId || changes.enforcementItem) {
      this.getEmployees();
      switch (changes.enforcementItem.currentValue.type) {
        case EnforcementType.EO:
          this.tableName = MatTableDefinitionService.TABLE_EO;
          break;
        case EnforcementType.EOD:
          this.tableName = MatTableDefinitionService.TABLE_EOD;
          break;
        case EnforcementType.Driver:
          this.tableName = MatTableDefinitionService.TABLE_DRIVERS;
          break;
      }
    }
  }

  private getEmployees(): void {
    if (EnforcementType[this.enforcementItem.type] === 'EOD') {
      this.job_type = 'Enforcer-Driver';
    } else {
      this.job_type = EnforcementType[this.enforcementItem.type];
    }
    this.projectEmployeeService.getEmployeesByProject({project_id: this.projectId, job_type: this.job_type}).subscribe( res => {
      this.employees = res;
      this.dataGrid.setData(this.employees);
      const observables = [];
      this.employees.forEach((employee: Employee) => {
        observables.push(this.projectEmployeeService.getAssignedProjects(employee.employee_id));
      });
      forkJoin(observables).pipe(take(1)).subscribe(result => {
        result.forEach((projects, index) => {
          (this.employees[index] as any).projects = projects.map((projectInfo, i) => {
            if (i === 0) {
              return `${projectInfo.project_name}`;
            } else {
              return ` ${projectInfo.project_name}`;
            }
          }).toString();
        });
      }, err => {
        if (err.error && err.error.message) {
          this.toastr.error(err.error.message, 'Error');
        } else if (err.error && err.error.error) {
          this.toastr.error(err.error.error, 'Error');
        }
      });
    });
  }

  public onAdd() {
    const dialogRef = this.dialog.open(EnforcementEoNewComponent, {
      width: '80%',
      data: {projectId: this.projectId, position: EnforcementType[this.enforcementItem.type]}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const employees: Employee[] = result;
        const observable = [];

        employees.forEach(employee => {

          const projectEmployee: ProjectEmployee = new ProjectEmployee();
          projectEmployee.employee_id = employee.employee_id;
          projectEmployee.project_id = this.projectId;
          projectEmployee.start_date = employee.date_start;
          projectEmployee.end_date = employee.date_end;
          observable.push(this.projectEmployeeService.create(projectEmployee));
        });

        if (observable.length) {
          forkJoin(observable).subscribe(() => {
            this.toastr.success('The employee is added successfully!', 'Success!');
            this.getEmployees();
          });
        }
      }
    });
  }

  public onSelect(employee: any) {
    this.dialog.open(EmployeeInfoComponent, {
      width: '90%',
      data: {
        employee,
      },
    });
  }

  public onDelete(employee: any) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const id = employee.project_employee_id;
        this.projectEmployeeService.delete(id).subscribe(() => {
          this.toastr.success('The employee is deleted successfully!', 'Success!');
          this.getEmployees();
        });
      }
    });
  }
}
