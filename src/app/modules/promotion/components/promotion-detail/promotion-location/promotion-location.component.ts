import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {globalProjectActivities, ProjectActivityItem, ProjectActivityType} from '../../../../../components/projects/models/project.model';
import {LoaderService} from '../../../../../services/loader.service';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ProjectActivity} from '../../../../../components/projects/models/project-activity.model';
import {ApiService} from '../../../../../core/services/api.service';
import {PromotionService} from '../../../services/promotion.service';
import { FormGroup } from '@angular/forms';
import {TableColumnsEditModalComponent} from '../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-promotion-location',
  templateUrl: './promotion-location.component.html',
  styleUrls: ['./promotion-location.component.scss']
})
export class PromotionLocationComponent implements OnInit {

  @Input() promotion: any;
  @Input() formGroup: FormGroup;
  @Input() canUpdate = false;

  activityTypes: ProjectActivityItem[] = globalProjectActivities.slice(0);

  originProjectActivities: any[];
  originfilteredProjectActivities: any[];
  filteredProjectActivities: any[] = [];
  selectedProjectIds: string[] = [];

  allChecked = false;
  displayedColumns = [
    {name: 'checked', label: 'Check Box', isShow: true},
    {name: 'project_code', label: 'Project Code', isShow: true},
    {name: 'project_name', label: 'Project Name', isShow: true},
    {name: 'project_location', label: 'Location', isShow: true},
    {name: 'activities', label: 'Activities', isShow: true}
  ];
  tableFields = [];
  showFields = [];

  constructor(
    private loaderService: LoaderService,
    private apiService: ApiService,
    private promotionService: PromotionService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      // TODO: Define in projects.service -> getAllWithActivity()
      this.originProjectActivities = await this.apiService.get('/pg/projects/with-activity');

      if (this.promotion.activity) {
        this.filteredProjectActivities = this.originProjectActivities.filter(projectActivity => !!projectActivity[this.promotion.activity])
          .map(projectActivity => {
            return {...projectActivity, checked: this.checkProjectExistence(projectActivity.id)};
          });
        this.fetchMatTable(this.filteredProjectActivities);
      }
    } finally {
      this.loaderService.disable();
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

  private checkProjectExistence(projectId) {
    return !!this.promotion.promotionParkings.find(promotionParking => +promotionParking.project_id === +projectId);
  }

  onChangeActivity(event) {
    this.filteredProjectActivities = this.originProjectActivities.filter(projectActivity => !!projectActivity[event.value])
      .map(projectActivity => {
        return {...projectActivity, checked: false};
      });
    this.fetchMatTable(this.filteredProjectActivities);
  }

  applyFilterProjects(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.originfilteredProjectActivities) {
      this.filteredProjectActivities = this.originfilteredProjectActivities.filter(row => {
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

  fetchMatTable(projectActivities): void {
    this.originfilteredProjectActivities = projectActivities;
    this.emitSelectedProjects();
  }

  checkAll(event) {
    if (this.filteredProjectActivities) {
      this.filteredProjectActivities = this.filteredProjectActivities.map((projectActivity) => ({
        ...projectActivity,
        checked: event.checked
      }));
      this.fetchMatTable(this.filteredProjectActivities);
    }
  }

  emitSelectedProjects() {
    const selectedProjectIds = this.filteredProjectActivities.filter(projectActivity => projectActivity.checked)
      .map((projectActivity) => projectActivity.id);
    this.promotionService.setSelectedProjects(selectedProjectIds);
  }

  checkProject() {
    this.emitSelectedProjects();
  }

  getAllChecked() {
    return this.filteredProjectActivities && this.filteredProjectActivities.every(projectActivity => projectActivity.checked);
  }

}
