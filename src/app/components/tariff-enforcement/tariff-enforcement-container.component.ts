import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PgProjectsService } from '../projects/services/projects.service';
import { PgProjectEmployeeService } from '../projects/services/project-employee.service';
import { CurrentUserService } from '../../services/current-user.service';
import { Project } from '../projects/models/project.model';
import { EnforcementViolationsComponent } from './enforcement-violations/enforcement-violations.component';
import { EnforcementGroupsComponent } from './enforcement-groups/enforcement-groups.component';
import { EscalationsListComponent } from './enforcement-escalations/escalations-list/escalations-list.component';
// import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-tariff-enforcement-container',
  templateUrl: './tariff-enforcement-container.component.html',
  styleUrls: ['./tariff-enforcement-container.component.scss']
})

export class TariffEnforcementContainerComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  today: number = Date.now();

  projects: Project[] = [];
  projectIdSelected: number;
  projectCodeSelected: string;

  // Permission Feature
  currentUser: any;
  canView = CurrentUserService.canView;

  tabLinks = [
    {
      label: 'Violations',
      link: (projectCode) => `/enforcement/${projectCode}/violations`,
      index: 0
    }, {
      label: 'Groups',
      link: (projectCode) => `/enforcement/${projectCode}/groups`,
      index: 1
    }, {
      label: 'Escalations',
      link: (projectCode) => `/enforcement/${projectCode}/escalations`,
      index: 2
    },
  ];

  constructor(
    private readonly pgProjectsService: PgProjectsService,
    private readonly pgProjectEmployeeService: PgProjectEmployeeService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private currentUserService: CurrentUserService,
  ) { }

  async ngOnInit() {
    this.currentUser = await this.currentUserService.get();
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        console.log('Container: activatedRoute.snapshot: ', this.activatedRoute.snapshot)
      });

    const routeParams = this.activatedRoute.snapshot.params;
    console.log('Container: RouteParams: ', routeParams)

    if (routeParams.projectCode) {
      this.chooseProjectByCode(routeParams.projectCode);
      console.log('Container: Choose project with code: ', this.projectCodeSelected)

    } else {
      this.chooseFirstProject();
      console.log('Container: Choose first project: ', this.projectCodeSelected)

      if (this.projectCodeSelected) {
        this.router.navigate(
          [`${this.projectCodeSelected}/violations`],
          { relativeTo: this.activatedRoute }
        );
      }
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onChangeProject(event) {
    this.projectIdSelected = event;
    this.pgProjectsService.emitProjectChanged(event);
    const selectedProject = this.projects
      .find(el => Number.parseInt(el.project_id, 10) === this.projectIdSelected);
    this.router.navigate([`/enforcement/${selectedProject.project_code}/violations`]);
  }

  onMountChild(componentRef: EnforcementViolationsComponent | EnforcementGroupsComponent | EscalationsListComponent) {
    // componentRef instanceof EnforcementViolationsComponent
    console.log('Container: OnMoundChild - activatedRoute.snapshot: ', this.activatedRoute.snapshot)
    const routeParams = this.activatedRoute.snapshot.params;
    if (routeParams.projectCode) {
      this.chooseProjectByCode(routeParams.projectCode);
    } else {
      this.chooseFirstProject();
    }
    componentRef.onActivate({ projectId: this.projectIdSelected, isAssignments: false, currentUser: this.currentUser });
  }

  chooseFirstProject() {
    const routeData = this.activatedRoute.snapshot.data;
    const { permission, assignedProjects, ...data } = routeData;
    this.projects = assignedProjects;

    if (this.projects && this.projects.length) {
      this.projectIdSelected = Number.parseInt(this.projects[0].project_id, 10);
      this.projectCodeSelected = this.projects[0].project_code;
    }
  }

  chooseProjectByCode(projectCode) {
    const routeData = this.activatedRoute.snapshot.data;
    const { permission, assignedProjects, ...data } = routeData;
    this.projects = assignedProjects;
    const selectedProject = this.projects
      .find(el => el.project_code === projectCode);

    if (selectedProject) {
      this.projectIdSelected = Number.parseInt(selectedProject.project_id, 10);
      this.projectCodeSelected =  projectCode;
    }
  }
}
