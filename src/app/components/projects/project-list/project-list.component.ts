import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { PgProjectsService } from '../services/projects.service';
import { ProjectListService } from '../services/project-list.service';
import { Project } from '../models/project.model';
import { CurrentUserService } from '../../../services/current-user.service';
import { LoaderService } from '../../../services/loader.service';
import { ActivatedRoute } from '@angular/router';
import { config } from '../../../../config';
import { GeneralviewFilterService } from '../../generalview/generalview-filter.service';
// import { PgProjectEmployeeService } from '../services/project-employee.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  @ViewChild('tabs') tabs;

  activeProjects: Project[] = [];
  allProjects: Project[];

  selectedTabIndex: number;
  selectedInsideTabIndex = 0;
  projectTabFeatures = [];

  // Permission Feature
  currentUser: any;
  canView = CurrentUserService.canView;
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  constructor(
    private domSanitizer: DomSanitizer,
    public matIconRegistry: MatIconRegistry,
    private pgProjectService: PgProjectsService,
    // private pgProjectEmployeeService: PgProjectEmployeeService,
    private projectListService: ProjectListService,
    private currentUserService: CurrentUserService,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
    private generalviewFilterService: GeneralviewFilterService,
  ) {
    this.matIconRegistry.addSvgIcon('maps', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/topbar/maps_icon.svg'));
    this.matIconRegistry.addSvgIcon('dashboard', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/topbar/dashboard_icon.svg'));
    this.matIconRegistry.addSvgIcon('analytics', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/topbar/analytics_icon.svg'));
    this.matIconRegistry.addSvgIcon('alerts', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/topbar/alerts_icon.svg'));
    this.matIconRegistry.addSvgIcon('org_chart', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/topbar/org_chart_icon.svg'));
    this.matIconRegistry.addSvgIcon('assets', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/topbar/assets_icon.svg'));
    this.matIconRegistry.addSvgIcon('productivity', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/topbar/productivity_icon.svg'));
    this.matIconRegistry.addSvgIcon('project_info', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/topbar/project_info_icon.svg'));
  }

  async ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        // console.log('queryParams', params);
        if (params.id) {
          this.pgProjectService.getProjectById(params.id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((res: any) => {
              if (this.activeProjects.find(element => element.id === +params.id)) {
                this.selectedTabIndex = this.activeProjects.indexOf(this.activeProjects.find(project => project.id === +params.id));
                this.selectedInsideTabIndex = this.projectTabFeatures.indexOf('project_orgchart');
              } else {
                this.activeProjects.push(res);
                this.updateProjectsStorage();
                this.selectedTabIndex = this.activeProjects.indexOf(this.activeProjects.find(project => project.id === res.id));
                this.selectedInsideTabIndex = this.projectTabFeatures.indexOf('project_orgchart');
              }
            });
        }
      });

    // this.route.data
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe(({ assignedProjects }) => {
    //     console.log('assignedProjects', assignedProjects);
    //     this.allProjects = assignedProjects;
    //     if (this.permission.isUpdate) {
    //       this.getActiveProjects(assignedProjects);
    //     }
    //   });

    this.projectListService.getActiveProject()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedProject: Project) => {
        // console.log('getActiveProject', selectedProject);
        if (selectedProject) {
          this.handleNewActiveProject(selectedProject);
        }
      });

    try {
      this.loaderService.enable();
      this.currentUser = await this.currentUserService.get();
      this.projectTabFeatures = config.projectTabFeatures.filter(feature => feature === 'project_maps' || this.canView(this.currentUser, feature));
      this.permission = CurrentUserService.canFeature(this.currentUser, 'project_manage');
      // this.getProjects();
      this.getProjects();
    } finally {
      this.loaderService.disable();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * To retrieve all project from the database and sort them with id
   */
  getProjects() {
    this.pgProjectService.getAllUserProjects()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        this.allProjects = result;
        if (this.permission.isUpdate) {
          this.getActiveProjects(result);
        }
      });
  }

  /**
   * To retrieve the projects to display (with the id of the project stored on the application)
   * @param allProjects All the project sorted by id
   */
  getActiveProjects(allProjects: Project[]) {
    const storageData = this.projectListService.getStorage();
    // console.log('Project List storageData: ', storageData)

    if (storageData) {
      this.activeProjects = allProjects
        .filter(project => storageData.activeProjects.includes(project.id));
      const selectedTabIndex = this.activeProjects
        .findIndex(project => project.id === storageData.selectedProjectId);
     const selectedInsideTabIndex = this.projectTabFeatures.indexOf(storageData.selectedInsideTab);
      setTimeout(() => {
        this.selectedTabIndex = selectedTabIndex !== -1 ? selectedTabIndex : this.activeProjects.length;
        this.selectedInsideTabIndex = selectedInsideTabIndex !== -1 ? selectedInsideTabIndex : 0;
      });
    }
  }

  /**
   * Remove project from list by index
   * @param tabIndex
   */
  removeFromList(tabIndex: number): void {
    const selectedProject = this.activeProjects[this.selectedTabIndex];
    this.projectListService.setInactiveProject(this.activeProjects[tabIndex]);
    this.activeProjects.splice(tabIndex, 1);
    if (this.activeProjects.length === 0) {
      this.projectListService.removeStorage();
    } else {
      if (tabIndex === this.selectedTabIndex) {
        this.selectedTabIndex = tabIndex === this.activeProjects.length ? tabIndex - 1 : tabIndex;
      } else if (this.selectedTabIndex <= this.activeProjects.length) {
        this.selectedTabIndex = this.activeProjects.findIndex( project => project.id === selectedProject.id);
      }
      this.updateProjectsStorage();
    }
    if (selectedProject) {
      this.generalviewFilterService.remove(selectedProject.id);
    }
  }

  /**
   * Event Handler of selectedIndex change
   * @param tabIndex
   */
  onSelectProjectTab(tabIndex: number) {
    this.selectedTabIndex = tabIndex;
    this.updateProjectsStorage();
  }

  /**
   * Update Active Projects and the Selected Project in their Subject
   */
  updateProjectsStorage() {
    if (this.selectedTabIndex > -1 && this.activeProjects[this.selectedTabIndex]) {
      const storageData = {
        activeProjects: this.activeProjects.map(project => project.id),
        selectedProjectId: this.selectedTabIndex === this.activeProjects.length ? -1 : this.activeProjects[this.selectedTabIndex].id,
        selectedInsideTab: this.projectTabFeatures[this.selectedInsideTabIndex]
      };
      this.projectListService.setStorage(storageData);
    }
  }

  handleNewActiveProject(selectedProject) {
    if (selectedProject.id === -1) {
      // show project list table
      this.selectedTabIndex = this.activeProjects.length;
      return;
    }
    this.activeProjects.push(selectedProject);
    this.selectedTabIndex = this.activeProjects.length;
    setTimeout(() => {
      this.selectedTabIndex = this.activeProjects.length - 1;
      this.selectedInsideTabIndex = 0;
    });
  }

  /**
   * Event handler on change of the inside tab
   * @param index of the tab
   */
  onSelectedInsideProjectTab(index: number) {
    this.selectedInsideTabIndex = index;
    this.updateProjectsStorage();
  }
}
