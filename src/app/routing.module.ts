import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { GeneralviewComponent } from './components/generalview/generalview.component';

import { LoginComponent } from './components/login/login.component';
import { ResetPasswordComponent } from './components/forgot-password/reset-password.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AnalyticsComponent } from './modules/analytics/components/analytics/analytics.component';

import { AssetsComponent } from './components/assets/assets.component';
import { AssetSelectComponent } from './components/assets/asset-select/asset-select.component';
import { AssetNewModelComponent } from './components/assets/asset-new-model/asset-new-model.component';
import { AssetNewTypeComponent } from './components/assets/asset-new-type/asset-new-type.component';
import { AssetSelectModelComponent } from './components/assets/asset-select-model/asset-select-model.component';

import { EmployeesTabComponent } from './components/employees/employees-tab.component';
import { EmployeeDetailsComponent } from './components/employees/employee-details/employee-details.component';
import { WorkplansTabComponent } from './components/workplans/workplans-tab.component';
import { WorkplanNewComponent } from './components/workplans/workplan-new/workplan-new.component';

import {ProjectListComponent} from './components/projects/project-list/project-list.component';
import {AddEmployeeComponent} from './components/employees/add-employee/add-employee.component';
import {ProjectNewComponent} from './components/projects/project-new/project-new.component';

import { WorkplanDetailsComponent } from './components/workplans/workplan-details/workplan-details.component';
import { AssignedEmployeeNewComponent } from './components/workplans/workplan-details/assigned-employee-new/assigned-employee-new.component';
import { AddProjectComponent } from './components/employees/add-project/add-project.component';
import { ValueAddedListComponent } from './components/value-added/value-added-list/value-added-list.component';
import { ValueAddedNewComponent } from './components/value-added/value-added-new/value-added-new.component';
import { TariffEnforcementContainerComponent } from './components/tariff-enforcement/tariff-enforcement-container.component';
import { TariffEnforcementComponent } from './components/tariff-enforcement/tariff-enforcement.component';
import { BundleNewComponent } from './components/value-added/bundle-new/bundle-new.component';

import { PermissionGuard } from './core/guards/permission.guard';
import { EmployeeGuard } from './core/guards/employee.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { ListCityResolve } from './components/heatmap/list-city.resolve';

import { AssignedProjectsResolve } from './components/projects/services/assigned-projects.resolve';
import { EnforcementViolationsComponent } from './components/tariff-enforcement/enforcement-violations/enforcement-violations.component';
import { EnforcementGroupsComponent } from './components/tariff-enforcement/enforcement-groups/enforcement-groups.component';
import { EscalationsListComponent } from './components/tariff-enforcement/enforcement-escalations/escalations-list/escalations-list.component';

// Operation Component
import { OperationLayoutComponent } from './operations/shared/components/operation-layout/operation-layout.component'

const appRoutes: Routes = <Routes> [
  {
    path: '', component: HomeComponent,
    data: {
      showSidebar: false,
      showNavbar: false,
    }
  },
  {
    path: 'login', component: LoginComponent,
    data: {
      showSidebar: false,
      showNavbar: false,
    }
  },
  {
    path: 'reset-password', component: ResetPasswordComponent,
    data: {
      showSidebar: false,
      showNavbar: false,
    }
  },
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},

  // Project section
  {
    path: 'project/list',
    component: ProjectListComponent,
    canActivate: [AuthGuard, PermissionGuard],
    resolve: {
      listCity: ListCityResolve,
      // assignedProjects: AssignedProjectsResolve
    },
    data: {
      permission: {
        feature: 'project_manage',
        type: 'is_view'
      }
    }
  },
  {
    path: 'project/new',
    component: ProjectNewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'project_manage',
        type: 'is_view'
      }
    }
  },
  {
    path: 'project/setup',
    loadChildren: 'app/modules/project-setup/project-setup.module#ProjectSetupModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'project_manage',
        type: 'is_update'
      }
    },
  },

  // Analytics Module
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'global_analytics',
        type: 'is_view'
      }
    }
  },

  // GeneralView(MAP)
  {
    path: 'map',
    component: GeneralviewComponent,
    canActivate: [AuthGuard],
    resolve: {
      listCity: ListCityResolve
    }
  },

  // Assets section
  {
    path: 'assets',
    component: AssetsComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'global_assets',
        type: 'is_view'
      }
    }
  },
  {
    path: 'assets/select',
    component: AssetSelectComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'global_assets',
        type: 'is_create'
      }
    }
  },
  {
    path: 'assets/select/models',
    component: AssetSelectModelComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'global_assets',
        type: 'is_view'
      }
    }
  },
  {
    path: 'assets/models/create',
    component: AssetNewModelComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'global_assets',
        type: 'is_create'
      }
    }
  },
  {
    path: 'assets/type/create',
    component: AssetNewTypeComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'global_assets',
        type: 'is_update'
      }
    }
  },

  // HR Employee section
  {
    path: 'employees',
    component: EmployeesTabComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'hr_employee',
        type: 'is_view'
      }
    }
  },
  {
    path: 'employees/create',
    component: AddEmployeeComponent,
    canActivate: [AuthGuard, PermissionGuard],
      data: {
          permission: {
              feature: 'hr_employee',
              type: 'is_create'
          }
      }
  },
  {
    path: 'employees/:employee_id',
    component: EmployeeDetailsComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'hr_employee',
        type: 'is_update'
      }
    }
  },
  {
    path: 'employees/create/add-project',
    component: AddProjectComponent,
    canActivate: [AuthGuard, PermissionGuard, EmployeeGuard],
    data: {
      permission: {
        feature: 'hr_employee',
        type: 'is_create'
      }
    }
  },

  // Workplans
  {
    path: 'workplans',
    component: WorkplansTabComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'hr_workplan',
        type: 'is_view'
      }
    }
  },
  {
    path: 'workplans/create',
    component: WorkplanNewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'hr_workplan',
        type: 'is_create'
      }
    }
  },
  {
    path: 'workplans/details',
    component: WorkplanDetailsComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'hr_workplan',
        type: 'is_view'
      }
    }
  },
  {
    path: 'workplans/assigned',
    component: AssignedEmployeeNewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'hr_workplan',
        type: 'is_update'
      }
    }
  },

  // Enforcement
  {
    path: 'enforcement',
    component: TariffEnforcementContainerComponent,
    canActivate: [AuthGuard, PermissionGuard],
    resolve: {
      assignedProjects: AssignedProjectsResolve
    },
    data: {
      permission: {
        feature: ['tariff_enforcement_violation', 'tariff_enforcement_group', 'tariff_enforcement_escalation'],
        type: 'is_update'
      }
    },
  },
  {
    path: 'enforcement/:projectCode',
    component: TariffEnforcementContainerComponent,
    canActivate: [AuthGuard, PermissionGuard],
    resolve: {
      assignedProjects: AssignedProjectsResolve
    },
    data: {
      permission: {
        feature: ['tariff_enforcement_violation', 'tariff_enforcement_group', 'tariff_enforcement_escalation'],
        type: 'is_update'
      }
    },
    children: [
      {
        path: 'violations',
        component: EnforcementViolationsComponent,
      },
      {
        path: 'violations/:operation',
        component: EnforcementViolationsComponent,
      },
      {
        path: 'groups',
        component: EnforcementGroupsComponent,
      },
      {
        path: 'groups/:operation',
        component: EnforcementGroupsComponent,
      },
      {
        path: 'escalations',
        component: EscalationsListComponent,
      },
      {
        path: 'escalations/:operation',
        component: EscalationsListComponent,
      },
    ]
  },
  {
    path: 'tariff/value-added',
    component: ValueAddedListComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'tariff_valueadded',
        type: 'is_view'
      }
    }
  },
  {
    path: 'tariff/value-added/new',
    component: ValueAddedNewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'tariff_valueadded',
        type: 'is_create'
      }
    }
  },
  {
    path: 'tariff/value-added/:id',
    component: ValueAddedNewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'tariff_valueadded',
        type: 'is_view'
      }
    }
  },
  {
    path: 'tariff/bundle/new',
    component: BundleNewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'tariff_valueadded',
        type: 'is_create'
      }
    }
  },
  {
    path: 'tariff/bundle/:id',
    component: BundleNewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'tariff_valueadded',
        type: 'is_view'
      }
    }
  },

  // Tariff Promotion section
  {
    path: 'tariff/promotions',
    loadChildren: 'app/modules/promotion/promotion.module#PromotionModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'tariff_promotion',
        type: 'is_view'
      }
    }
  },

  // Admin section
  {
    path: 'admin',
    loadChildren: 'app/modules/admin/admin.module#AdminModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: ['admin_rights_template', 'admin_users_rights', 'admin_credentials'],
        type: 'is_view'
      }
    }
  },

  {
    path: 'crm',
    loadChildren: 'app/modules/crm/crm.module#CRMModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: ['crm_jobs_view', 'crm_contravention_view'],
        type: 'is_view'
      }
    },
  },

  {
    path: 'default-values',
    loadChildren: 'app/modules/default-value/default-value.module#DefaultValueModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: ['setting_default_value'],
        type: 'is_view'
      }
    },
  },

  // Assignment
  {
    path: 'assignments',
    loadChildren: 'app/modules/assignment/assignment.module#AssignmentModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: ['hr_assignment'],
        type: 'is_view'
      }
    },
  },

  // Tariff Parking
  {
    path: 'tariff/parking',
    loadChildren: 'app/modules/tariff-parking/tariff-parking.module#TariffParkingModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: ['tariff_parking'],
        type: 'is_view'
      }
    }
  },

  // Operations
  {
    path: 'operation',
    component: OperationLayoutComponent,
    loadChildren: 'app/operations/modules/cn-review/cn-review.module#CnReviewModule',
    canLoad: [PermissionGuard],
    data: {
        title: 'CN Review',
        breadcrumb: 'common.enforcement',
        permission: {
        feature: ['enforcement_cn_review'],
        type: 'is_view'
        }
    }
  },
  {
    path: 'operation',
    component: OperationLayoutComponent,
    loadChildren: 'app/operations/modules/cn-challenge/cn-challenge.module#CnChallengeModule',
    canLoad: [PermissionGuard],
    data: {
        title: 'CN Challenge',
        breadcrumb: 'common.enforcement',
        permission: {
        feature: ['enforcement_cn_challenge'],
        type: 'is_view'
        }
    }
  },
  {path: '**', redirectTo: 'map', pathMatch: 'full'}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(
      appRoutes,
      {
        preloadingStrategy: PreloadAllModules
      }
    )
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class RoutingModule { }
