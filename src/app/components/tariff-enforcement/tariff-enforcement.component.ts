import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PgProjectsService } from '../projects/services/projects.service';
import { PgProjectEmployeeService } from '../projects/services/project-employee.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrentUserService } from '../../services/current-user.service';
import { EscalationsListComponent } from './enforcement-escalations/escalations-list/escalations-list.component';
import { Project } from '../projects/models/project.model';

@Component({
  selector: 'app-tariff-enforcement',
  templateUrl: './tariff-enforcement.component.html',
  styleUrls: ['./tariff-enforcement.component.scss']
})

export class TariffEnforcementComponent implements OnInit, OnDestroy {
  @ViewChild(EscalationsListComponent) child: EscalationsListComponent;

  ngUnsubscribe: Subject<void> = new Subject<void>();
  today: number = Date.now();

  @Input() projectId: number;

  selectedTab;
  projectIdSelected: number;

  projects: Project[] = [];

  // Permission Feature
  currentUser: any;
  canView = CurrentUserService.canView;

  constructor(
    private readonly pgProjectsService: PgProjectsService,
    private readonly pgProjectEmployeeService: PgProjectEmployeeService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private currentUserService: CurrentUserService,
  ) { }

  async ngOnInit() {
    try {
      this.currentUser = await this.currentUserService.get();
      this.activatedRoute.params
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(params => {
          if (params.projectId) {
            // Project Enforcement Setup
            this.getOneProject(params.projectId);
            // this.singleProjectMode = true;
            console.log('case 1:', this.projectId, params);
          } else {
            // Tariff Enforcement
            this.getAllAssignedProjects();
            // this.singleProjectMode = false;
          }
        });
    } finally {
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAllAssignedProjects(selectedId: string = null) {
    const employee = this.authService.user;
    if (employee && employee.employee_id) {
      this.pgProjectEmployeeService
        .getAssignedProjects(employee.employee_id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.projects = res;
          if (selectedId) {
            const selectedProject = this.projects
              .find(el =>
                Number.parseInt(el.project_id, 10) === Number.parseInt(selectedId, 10)
              );
            this.projectIdSelected = Number.parseInt(selectedProject.project_id);
          } else {
            this.projectIdSelected = Number.parseInt(this.projects[0].project_id, 10);
          }
        });
    }
  }

  getOneProject(projectId: string | number) {
    this.pgProjectsService.getProjectById(projectId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.projects = [res];
        this.projectIdSelected = this.projects[0].id;
      });
  }

  onChangeProject(event) {
    this.projectIdSelected = event;
    this.pgProjectsService.emitProjectChanged(event);
  }
}
