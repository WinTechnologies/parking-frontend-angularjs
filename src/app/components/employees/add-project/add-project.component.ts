import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee, EmployeeWp } from '../models/employee.model';
import { AddProjectService } from './add-project.service';
import { PgProjectsService } from '../../projects/services/projects.service';
import { Project } from '../../projects/models/project.model';
import { forkJoin, Subject } from 'rxjs';
import { PgProjectActivityService } from '../../projects/services/project-activity.service';
import { ProjectActivity } from '../../projects/models/project-activity.model';
import { PgWorkplanService } from '../../workplans/workplan.service';
import { Workplan } from '../../workplans/models/workplan.model';
import { PgEmployeeWpService } from '../employee-wp.service';
import { PgProjectEmployeeService } from '../../projects/services/project-employee.service';
import { ProjectEmployee } from '../../projects/models/project-employee.model';
import { ToastrService } from 'ngx-toastr';
import { PgEmployeeService } from '../employee.service';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})

export class AddProjectComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();

  projects: Project[];
  projectActivities: ProjectActivity[];
  workplans: Workplan[];
  filteredProjects: Project[];
  filteredWorkplans: Workplan[];
  selectedProjects: Project[] = [];
  selectedWorkplans: Workplan[] = [];
  employee: Employee;
  seeAll = false;

  @Input() dialog = false;
  @Output() selectedProjectsOutput: EventEmitter<Project[]> = new EventEmitter<Project[]>();
  @Output() selectedWorkplansOutput: EventEmitter<Workplan[]> = new EventEmitter<Workplan[]>();

  baseUrl = this.apiEndpoint + '/';
  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private addProjectService: AddProjectService,
              private projectService: PgProjectsService,
              private projectActivityService: PgProjectActivityService,
              private workplanService: PgWorkplanService,
              private employeeService: PgEmployeeService,
              private employeeWpService: PgEmployeeWpService,
              private projectEmployeeService: PgProjectEmployeeService,
              private toastrService: ToastrService,
              @Inject('API_ENDPOINT') private apiEndpoint: string)
  {
    this.employee = this.addProjectService.getEmployee();
  }

  ngOnInit() {
    this.load();
  }

  private load() {
    forkJoin(
      this.projectEmployeeService.getProjectEmployee(),
      this.projectService.getAllUserProjects(),
      this.projectActivityService.get(),

      this.employeeWpService.get(),
      this.workplanService.get()
    ).subscribe(res => {
      const project_id = res[0].filter(x => {
        if (x.employee_id === this.employee.employee_id) {
          return x;
        }
      }).map(x => +x.project_id);
      this.projects = res[1]
        .filter(x => !project_id.includes(x.id))
        .sort((a: Project, b: Project) => a.id - b.id );

      this.projectActivities = res[2];

      // To retrieve the workplans already assigned to this employee and filter the list of displayed workplan
      const workplanIds = res[3].filter(x => {
        if (x.employee_id === this.employee.employee_id) {
          return x;
        }
      }).map(x => x.id);
      this.workplans = res[4]
        .filter(x => !workplanIds.includes(x.id));
      this.filteredProjects = this.projects;
      this.filteredWorkplans = this.workplans;
    });
  }

  public onBack() {
    this.location.back();
  }

  /**
   * To filter the projects
   * @param filter
   */
  public applyFilterProject(filter) {
    filter = filter.trim().toLowerCase();
    this.filteredProjects = this.projects.filter( project => {
      return (project.id.toLocaleString().indexOf(filter) >= 0) ||
        (project.project_name.toLocaleLowerCase().indexOf(filter) >= 0);
    });
  }

  /**
   * To filter the workplans
   * @param filter
   */
  public applyFilterWorkplan(filter) {
    filter = filter.trim().toLowerCase();
    this.filteredWorkplans = this.workplans.filter( workplan => {
      return workplan.wp_name.toLocaleLowerCase().indexOf(filter) >= 0;
    });
  }

  /**
   * To add a project on click
   * @param project
   */
  public addProject(project: Project) {
    if (!this.selectedProjects.includes(project)) {
      this.selectedProjects.push(project);
    } else {
      this.selectedProjects.splice(this.selectedProjects.indexOf(project));
    }
    this.selectedProjectsOutput.emit(this.selectedProjects);
  }

  /**
   * To add a workplan on click
   * @param workplan
   */
  public addWorkplan(workplan: Workplan) {
    if (!this.selectedWorkplans.includes(workplan)) {
      this.selectedWorkplans.push(workplan);
    } else {
      this.selectedWorkplans.splice(this.selectedWorkplans.indexOf(workplan));
    }
    this.selectedWorkplansOutput.emit(this.selectedWorkplans);
  }

  /**
   * To display all the project and employee
   */
  public changeSeeAll() {
    this.seeAll = !this.seeAll;
  }

  /**
   * To reinitialize the the selected project and workplan
   */
  public onCancel() {
    this.selectedWorkplans = [];
    this.selectedProjects = [];
  }

  /**
   * On Click on the button Confirm
   */
  public onSubmit() {
    // If the user didn't choose a project or workplan
    if (!this.selectedProjects.length) {
      this.toastrService.error('You have to choose a project and a workplan', 'Error!');
      return;
    }

    // An array that will contain all the request to add the employee on the table employee, project_employee, employee_wp
    const observable = [];
    this.selectedProjects.forEach(selectedProject => {
      const projectEmployee = new ProjectEmployee();
      projectEmployee.employee_id = this.employee.employee_id;
      projectEmployee.project_id = selectedProject.id;
      projectEmployee.start_date = new Date();
      projectEmployee.end_date = selectedProject.end_date;
      observable.push(this.projectEmployeeService.create(projectEmployee));
    });

    this.selectedWorkplans.forEach(selectedWorkplan => {
      const employeeWp = new EmployeeWp();
      employeeWp.employee_id = this.employee.employee_id;
      employeeWp.workplan_id = selectedWorkplan.id;
      employeeWp.wp_reoccuring_id = '{' + selectedWorkplan.reoccurings.map(v => v.id).join(',') + '}';
      employeeWp.wp_exception_id = '{' + selectedWorkplan.exceptions.map(v => v.id).join(',') + '}';
      observable.push(this.employeeWpService.create([employeeWp]));
    });

    // To execute all the request
    forkJoin(observable).subscribe(res => {
      this.toastrService.success('Assigned for new employee successfully!', 'Success!');
      this.router.navigate(['employees']);
    }, err => {
      this.toastrService.error(err.error.message, 'Error!');
      this.router.navigate(['employees']);
    });
  }

  /**
   * When the user change page we delete the employee from the service
   */
  ngOnDestroy(): void {
    this.addProjectService.setEmployee(null);
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
