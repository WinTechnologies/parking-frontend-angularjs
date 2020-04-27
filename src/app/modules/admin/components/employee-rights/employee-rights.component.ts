import { Component, OnInit } from '@angular/core';
import { Employee } from '../../../../components/employees/models/employee.model';
import { EmployeePermissionService } from '../../services/employee-permission.service';
import { LoaderService } from '../../../../services/loader.service';
import { PgProjectsService } from '../../../../components/projects/services/projects.service';
import { Project } from '../../../../components/projects/models/project.model';
import { PermissionTemplate } from '../../models/permission-template.model';
import { PermissionFeature, PermissionType } from '../../models/shared.model';
import { PermissionSharedService } from '../../../../services/permission-shared.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { configAdmin } from '../../../../../config/config-admin';
import { PermissionTemplateService } from '../../services/permission-template.service';

@Component({
  selector: 'app-employee-rights',
  templateUrl: './employee-rights.component.html',
  styleUrls: ['./employee-rights.component.scss']
})

export class EmployeeRightsComponent implements OnInit {
  employees: Employee[] = [];

  // For Project filter
  selectedProjectId: number;
  projects: Project[] = [];
  filteredProjects: Observable<any[]>;
  projectInput = new FormControl();

  // For Permission filter
  template: PermissionTemplate;
  features: PermissionFeature[] = [];
  globalFeatures: PermissionFeature[] = [];
  projectFeatures: PermissionFeature[] = [];
  types: PermissionType[] = [];
  offPermissionType = configAdmin.offPermissionType;
  defaultPermissionType: PermissionType;

  // Filter Params
  selectedFilters: any;

  constructor(
    private employeePermissionService: EmployeePermissionService,
    private loaderService: LoaderService,
    private projectService: PgProjectsService,
    private permissionSharedService: PermissionSharedService,
  ) {}

  ngOnInit() {
    this.initData();

    this.filteredProjects = this.projectInput.valueChanges
      .pipe(
        startWith<string | Project>(''),
        map(value => typeof value === 'string' ? value : value.project_name),
        map(project => project ? this.filterProjects(project) : this.projects.slice())
      )
    ;
  }

  async initData() {
    try {
      this.loaderService.enable();
      const promises = [
        this.projectService.getAllUserProjects().toPromise(),
        this.employeePermissionService.getByPermissions({}),
        this.permissionSharedService.getFeatures(),
        this.permissionSharedService.getTypes()
      ];

      [this.projects, this.employees, this.features, this.types] = await Promise.all(promises);
      this.defaultPermissionType = this.types.find(type => type.permission_type === this.offPermissionType);
      this.globalFeatures = this.features.filter(feature => feature.section !== 'Project');
      this.projectFeatures = this.features.filter(feature => feature.section === 'Project');

      this.template = PermissionTemplateService.createDefaultTemplate(this.features, this.defaultPermissionType);
    } finally {
      this.loaderService.disable();
    }
  }

  onChangeFeature(event, featureName) {
    this.template[featureName] = this.types.find((type) => {
      return type.is_off === (event.length === 0) &&
        type.is_view === event.includes('view') &&
        type.is_create === event.includes('create') &&
        type.is_update === event.includes('update') &&
        type.is_delete === event.includes('delete');
    });
  }

  async getEmployeesByFilters() {
    try {
      this.loaderService.enable();
      this.employees = await this.employeePermissionService.getByPermissions(this.makeFilterParams());
    } finally {
      this.loaderService.disable();
    }
  }

  private makeFilterParams() {
    const params = {};
    if (this.selectedProjectId) {
      params['projectId'] = this.selectedProjectId;
    }
    const selectedFeatures = this.features.filter((feature) => {
      return this.template[feature.feature] && this.template[feature.feature].permission_type !== this.offPermissionType;
    });
    selectedFeatures.forEach(feature => {
      params[feature.feature] = this.getAvailablePermissionTypes(feature);
    });
    return params;
  }

  private getAvailablePermissionTypes(feature: PermissionFeature): string[] {
    const permissions = ['is_view', 'is_create', 'is_update', 'is_delete'];
    const truePermissions = permissions.filter(permission => this.template[feature.feature][permission]);
    return this.types.filter(type => truePermissions.every(permission => type[permission]))
      .map(type => type.permission_type)
    ;
  }

  // Project filter section
  displayAutocompleteProjects(project?: Project): string | undefined {
    return project ? project.project_name : undefined;
  }

  private filterProjects(projectName: string): Project[] {
    const filterValue = projectName.toLowerCase();
    return this.projects.filter(project => project.project_name.toLowerCase().indexOf(filterValue) === 0);
  }
}
