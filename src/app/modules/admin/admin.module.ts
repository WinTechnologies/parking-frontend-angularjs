import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TreeviewModule } from 'ngx-treeview';
import { PermissionTemplatesComponent } from './components/permission-templates/permission-templates.component';
import { PermissionTemplateComponent } from './components/permission-template-detail/permission-template/permission-template.component';
import { PermissionTemplateService } from './services/permission-template.service';
import { PermissionTemplateDetailComponent } from './components/permission-template-detail/permission-template-detail/permission-template-detail.component';
import { PermissionAssignedEmployeesComponent } from './components/permission-template-detail/permission-assigned-employees/permission-assigned-employees.component';
import { PermissionEmployeesModalComponent } from './components/permission-template-detail/permission-employees-modal/permission-employees-modal.component';
import { PermissionEmployeesModalService } from './services/permission-employees-modal.service';
import { EmployeePermissionService } from './services/employee-permission.service';
import { EmployeeRightsComponent } from './components/employee-rights/employee-rights.component';
import { PermissionEmployeesComponent } from './components/permission-employees/permission-employees.component';
import { CredentialsComponent } from './components/credentials/credentials.component';
import { EmployeeUpdateDetailsComponent } from './components/credentials/update-details/update-details.component';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { SharedModule } from '../../shared/shared.module';

const adminRoutes: Routes = [
  { path: 'permission-templates', component: PermissionTemplatesComponent, canActivate: [PermissionGuard],
    data: {
      permission: {
        feature: 'admin_rights_template',
        type: 'is_view'
      }
    }
  },
  { path: 'permission-templates/new', component: PermissionTemplateDetailComponent, canActivate: [PermissionGuard],
    data: {
      permission: {
        feature: 'admin_rights_template',
        type: 'is_create'
      }
    }
  },
  { path: 'permission-templates/:id', component: PermissionTemplateDetailComponent, canActivate: [PermissionGuard],
    data: {
      permission: {
        feature: 'admin_rights_template',
        type: 'is_view'
      }
    }
  },
  { path: 'employee-rights', component: EmployeeRightsComponent, canActivate: [PermissionGuard],
    data: {
      permission: {
        feature: 'admin_users_rights',
        type: 'is_view'
      }
    }
  },
  { path: 'credentials', component: CredentialsComponent, canActivate: [PermissionGuard],
    data: {
      data: {
        permission: {
          feature: 'admin_credentials',
          type: 'is_view'
        }
      }
    }
  },
  { path: 'credentials/update-details/:id', component: EmployeeUpdateDetailsComponent, canActivate: [PermissionGuard],
    data: {
      permission: {
        feature: 'admin_credentials',
        type: 'is_view'
      }
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes),
    TreeviewModule.forRoot(),
    SharedModule,
  ],
  declarations: [
    PermissionTemplatesComponent,
    PermissionTemplateComponent,
    PermissionTemplateDetailComponent,
    PermissionAssignedEmployeesComponent,
    PermissionEmployeesModalComponent,
    EmployeeRightsComponent,
    PermissionEmployeesComponent,
    CredentialsComponent,
    EmployeeUpdateDetailsComponent
  ],
  exports: [
    PermissionTemplateComponent
  ],
  providers: [
    PermissionTemplateService,
    PermissionEmployeesModalService,
    EmployeePermissionService,
  ],
  entryComponents: [
    PermissionEmployeesModalComponent,
  ]
})
export class AdminModule { }