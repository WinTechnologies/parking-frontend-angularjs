import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { Employee } from '../models/employee.model';
import { PgEmployeeService } from '../employee.service';
import { PgEmployeeWpService } from '../employee-wp.service';
import { PgWorkplanService } from '../../workplans/workplan.service';
import { PgProjectEmployeeService } from '../../projects/services/project-employee.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { PgProjectsService } from '../../projects/services/projects.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AddProjectService } from '../add-project/add-project.service';
import { AddProjectDialogComponent } from './add-project-dialog/add-project-dialog.component';
import { WorkplanSelectPopupComponent } from '../../workplans/workplan-select-popup/workplan-select-popup.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})

export class EmployeeDetailsComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  employee: Employee;
  workplan_id: number;
  projectId;
  projectName;
  isProjectAvailable = true;
  showEditInfo = false;

  baseUrl: string = this.apiEndpoint + '/';
  projects = [];
  employee_projects: any[];
  selectedTabIndex: number;

  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  constructor(
    private readonly route: ActivatedRoute,
    private location: Location,
    private readonly employeeService: PgEmployeeService,
    private readonly employeewpService: PgEmployeeWpService,
    private readonly workplanService: PgWorkplanService,
    private readonly pgProjectEmployeeService: PgProjectEmployeeService,
    private readonly pgProjectsService: PgProjectsService,
    private addProjectService: AddProjectService,
    private readonly toastrService: ToastrService,
    public dialog: MatDialog,
    private currentUserService: CurrentUserService,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
    this.route.params.subscribe(params => {
      if (params['employee_id']) {
        const employeeId = params['employee_id'];
        this.getEmployee(employeeId);
      }
    });
  }

  async ngOnInit() {
    try {
      const currentUser = await this.currentUserService.get();
      this.permission = CurrentUserService.canFeature(currentUser, 'hr_employee');
    } finally {
    }
  }

  private getWorkplan(employee_id) {
    this.employeewpService.get({ employee_id: employee_id })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res.length) {
          this.workplan_id = res[0].workplan_id;
        }
      });
  }

  private getEmployee(employeeId: string) {
    this.employeeService.getEmployee(employeeId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(employee => {
        if (employee) {
          this.employee = employee;
          this.getWorkplan(this.employee.employee_id);
          this.getAllProjects();
          this.getProjects(this.employee.employee_id);
        }
      });
  }

  getProjects(employeeId) {
    this.pgProjectEmployeeService.getAssignedProjects(employeeId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.employee_projects = res.sort((a, b) => a.project_id - b.project_id);
          if (!!this.employee_projects.length) {
            this.projectId = this.employee_projects[0].project_id;
            this.projectName = this.employee_projects[0].project_name;
          }
          this.isEmployeeOnProject();
        }
      }, err => {
        if (err.error && err.error.message) {
          this.toastrService.error(err.error.message, 'Error');
        } else if (err.error && err.error.error) {
          this.toastrService.error(err.error.error, 'Error');
        }
      });
  }

  getAllProjects() {
    this.pgProjectsService.getAllUserProjects()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.projects = res;
        }
      });
  }

  onChangeProject(event) {
    this.projectId = event;
    this.projectName = this.projects.find(elem => elem.id === +event).project_name;
    this.isEmployeeOnProject();
  }

  public onBack() {
    this.location.back();
  }

  private isEmployeeOnProject(): void {
    this.isProjectAvailable = !!this.employee_projects.length;
  }

  public onAddWorkplan() {
    const addPopupRef = this.dialog.open(WorkplanSelectPopupComponent, {
      width: '80%',
      data: {employeeId: this.employee.employee_id}
    });
    addPopupRef.afterClosed()
      .subscribe((res) => {
        if (res && res.success) {
          this.getWorkplan(this.employee.employee_id);
        }
      });
  }

  onAddProject(): void {
    this.addProjectService.setEmployee(this.employee);
    const dialogRef = this.dialog.open(AddProjectDialogComponent, {
      width: '90%',
      data: {
        employee: this.employee
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.success) {
        this.getEmployee(this.employee.employee_id.toString());
      }
    });
  }

  onEmployeeUpdated(employee: Employee) {
    if (employee) {
      this.employee = {
        ...this.employee,
        ...employee,
      };
    }

    this.showEditInfo = false;
    this.selectedTabIndex = 0;
  }

  showEditInfoHandler() {
    this.showEditInfo = true;
    this.selectedTabIndex = 5;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
