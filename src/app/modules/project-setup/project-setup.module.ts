import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';

import {PermissionGuard} from 'app/core/guards/permission.guard';
import {AuthGuard} from 'app/core/guards/auth.guard';

import {CommonSetupModule} from './common-setup/common-setup.module';
import {OnstreetSetupModule} from './onstreet-setup/onstreet-setup.module';
import {CarparkSetupModule} from './carpark-setup/carpark-setup.module';
import {EnforcementSetupModule} from './enforcement-setup/enforcement-setup.module';

const routes: Routes = [
  {
    path: 'onstreet',
    loadChildren: 'app/modules/project-setup/common-setup/common-setup.module#CommonSetupModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'project_manage',
        type: 'is_update'
      }
    }
  },
  {
    path: 'carpark',
    loadChildren: 'app/modules/project-setup/carpark-setup/carpark-setup.module#CarparkSetupModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'project_manage',
        type: 'is_update'
      }
    }
  },
  {
    path: 'enforcement',
    loadChildren: 'app/modules/project-setup/enforcement-setup/enforcement-setup.module#EnforcementSetupModule',
    canLoad: [AuthGuard, PermissionGuard],
    data: {
      permission: {
        feature: 'project_manage',
        type: 'is_update'
      }
    }
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSetupModule,
    OnstreetSetupModule,
    CarparkSetupModule,
    EnforcementSetupModule,
  ],
  exports: [
    CommonSetupModule,
    OnstreetSetupModule,
    CarparkSetupModule,
    EnforcementSetupModule,
  ]
})
export class ProjectSetupModule { }
