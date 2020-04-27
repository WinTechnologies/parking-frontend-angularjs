import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { Project } from '../../models/project.model';
import { PgProjectsService } from '../../services/projects.service';
import { ProjectListService } from '../../services/project-list.service';
import { TableColumnsEditModalComponent } from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-project-list-modal',
  templateUrl: './project-list-modal.component.html',
  styleUrls: ['./project-list-modal.component.scss']
})

export class ProjectListModalComponent implements OnInit {
  projects: Project[];
  displayedColumns = [
    {name: 'id', label: 'Project ID', isShow: true},
    {name: 'project_id', label: 'Project Code', isShow: true},
    {name: 'project_name', label: 'Project Name', isShow: true},
    {name: 'project_location', label: 'Location', isShow: true},
    {name: 'type_establishment', label: 'Establishment', isShow: true},
    {name: 'currency_code', label: 'Currency', isShow: true},
    {name: 'start_date', label: 'Start date', isShow: true},
    {name: 'end_date', label: 'End date', isShow: true},
    {name: 'vat_id', label: 'VAT ID', isShow: true},
  ];

  baseUrl: string = this.apiEndpoint + '/';
  project = new Project;
  projectOrigin = [];

  showFields = [];
  tableFields = [];
  filterValue = '';

  constructor(
    private pgProjectService: PgProjectsService,
    private projectListService: ProjectListService,
    private router: Router,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ProjectListModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
  ) {
    this.projects = data.projects;
    this.projectOrigin = data.projects;
  }

  ngOnInit() {
    setTimeout(() => {
      this.fetchMatTable(this.projects);
    });
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

  getProjects() {
    this.pgProjectService.getAllUserProjects().subscribe(result => {
      this.projects = result;
      this.fetchMatTable(this.projects);
    });
  }

  private fetchMatTable(projects: Project[]): void {
    this.projectOrigin = projects;
    this.applyFilterProjects(this.filterValue);
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

  public applyFilterProjects(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.projectOrigin) {
      this.projects = this.projectOrigin.filter(row => {
        let bRet = true;
        let cRet = false;
        this.showFields.forEach(value => {
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

  public onCancel() {
    this.dialogRef.close(false);
  }

  public onSelect(event: any) {
    if (event.type === 'click') {
      this.dialogRef.close(event.row);
    }
  }
}
