import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Project } from '../../models/project.model';
import { PgProjectsService } from '../../services/projects.service';
import { ProjectListService } from '../../services/project-list.service';
import { AlertdialogComponent } from '../../../alertdialog/alertdialog.component';
import { CurrentUserService } from '../../../../services/current-user.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../../../services/loader.service';
import { TableColumnsEditModalComponent } from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';
import { takeUntil} from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-project-all',
  templateUrl: './project-all.component.html',
  styleUrls: ['./project-all.component.scss']
})

export class ProjectAllComponent implements OnInit, OnDestroy, OnChanges {
  @Input() permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };
  @Input() tabIndex;

  projects: Project[];
  // @Input() set projects(allProjects) {
  //   this._projects = allProjects;
  //   console.log('project-all projects', allProjects)
  //   this.filterProjects();
  // }
  // get projects(): Project[] {
  //   return this._projects;
  // }
  // private _projects: Project[];

  tableFields = [];
  showFields = [];
  filterValue = '';
  filteredProjects: Project[];
  displayedColumns = [
    {name: 'project_code', label: 'Project Code', isShow: true},
    {name: 'project_name', label: 'Project Name', isShow: true},
    {name: 'project_location', label: 'Location', isShow: true},
    {name: 'type_establishment', label: 'Establishment', isShow: true},
    {name: 'currency_code', label: 'Currency', isShow: true},
    {name: 'start_date', label: 'Start date', isShow: true},
    {name: 'end_date', label: 'End date', isShow: true},
    {name: 'vat_code', label: 'VAT ID', isShow: true},
  ];
  baseUrl: string = this.apiEndpoint + '/';
  project = new Project;
  projectOrigin = [];

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private pgProjectService: PgProjectsService,
    private projectListService: ProjectListService,
    private router: Router,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    private dialog: MatDialog,
    private currentUserService: CurrentUserService,
    private readonly toastr: ToastrService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.projectListService.getInactiveProject()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedProject: Project) => {
        // console.log('getInactiveProject: ', selectedProject)
        if (selectedProject) {
          this.getProjects();
          // this.filterProjects();
        }
      });

    if (this.permission.isDelete) {
      this.displayedColumns.push({ name: 'action', label: 'Action', isShow: true});
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tabIndex) {
      // console.log('Project-all changes.tabIndex: ', changes.tabIndex)
      // this.filterProjects();
      this.getProjects();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // private filterProjects() {
  //   //   this.filteredProjects =  this.filterOnlyInActiveProjects(this.projects);
  //   //   console.log('Project-all filteredProjects: ', this.filteredProjects)
  //   //   this.fetchMatTable(this.filteredProjects);
  //   // }

  getProjects() {
    this.pgProjectService.getAllUserProjects().subscribe(result => {
      this.projects = result;
      this.filteredProjects = this.filterOnlyInActiveProjects(this.projects.slice(0));
      this.fetchMatTable(this.filteredProjects);
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

  private filterOnlyInActiveProjects(projects: Project[]) {
    const storageData = this.projectListService.getStorage();
    // console.log('Project All storageData: ', storageData)
    if (storageData) {
      projects = projects.filter(project => !storageData.activeProjects.includes(project.id));
    }
    return projects;
  }

  private fetchMatTable(projects: Project[]): void {
    this.projectOrigin = projects;
  }

  public applyFilterProjects(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.projectOrigin) {
      this.filteredProjects = this.projectOrigin.filter(row => {
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
    this.filterValue = filterValue;
  }

  public onAddProject() {
    this.router.navigate(['project/new']);
  }

  public onSelect(event: any) {
    if (event.type === 'click') {
      if (!this.permission.isUpdate) {
        this.currentUserService.showNotAccessToastr();
        return;
      }
      this.removeActiveProject(event.row);
      this.projectListService.setActiveProject(event.row);
    }
  }

  private removeActiveProject(selectedProject) {
    const index = this.filteredProjects.findIndex(project => project.id === selectedProject.id );
    this.filteredProjects.splice(index, 1);
    this.fetchMatTable(this.filteredProjects);
  }

  private addInactiveProject(selectedProject) {
    const index = this.filteredProjects.findIndex(project => project.id > selectedProject.id);
    this.filteredProjects.splice(index, 0, selectedProject);
    this.fetchMatTable(this.filteredProjects);
  }

  public onDelete(project: Project) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete ' + project.project_name + ' project?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loaderService.enable();
          this.pgProjectService.delete(project).subscribe(res => {
            this.toastr.success('The project is deleted successfully!', 'Success!');
            // console.log('after delete dialog')
            // // TODO: refresh projects this.getProjects();
            this.getProjects();
            this.loaderService.disable();
        },
        err => {
          this.loaderService.disable();
        });
      }
    });
  }
}
