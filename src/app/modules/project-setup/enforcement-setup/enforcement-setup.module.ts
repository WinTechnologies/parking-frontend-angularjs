import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {PermissionGuard} from '../../../core/guards/permission.guard';
import {AuthGuard} from '../../../core/guards/auth.guard';
import {CommonSetupModule} from '../common-setup/common-setup.module';

import {EnforcementComponent} from './components/enforcement.component';
import {EnforcementEoListComponent} from './components/enforcement-eo/enforcement-eo-list/enforcement-eo-list.component';
import {EnforcementEoNewComponent} from './components/enforcement-eo/enforcement-eo-new/enforcement-eo-new.component';
import {EnforcementAssetListComponent} from './components/enforcement-asset/enforcement-asset-list/enforcement-asset-list.component';
import {EnforcementAssetNewComponent} from './components/enforcement-asset/enforcement-asset-new/enforcement-asset-new.component';
import {EnforcementDeviceListComponent} from './components/enforcement-devices/enforcement-device-list/enforcement-device-list.component';
import {EnforcementDeviceNewComponent} from './components/enforcement-devices/enforcement-device-new/enforcement-device-new.component';
import {EnforcementRoutesComponent} from './components/enforcement-routes/enforcement-routes.component';
import {RouteListComponent} from './components/enforcement-routes/route-list/route-list.component';
import {RouteDetailsComponent} from './components/enforcement-routes/route-details/route-details.component';
import {RouteMapComponent} from './components/enforcement-routes/route-map/route-map.component';
import {RouteStaffComponent} from './components/enforcement-routes/route-staff/route-staff.component';

const routes: Routes = [
  {
    path: '',
    component: EnforcementComponent,
    canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
        feature: ['project_manage'],
        type: 'is_update'
      }
    },
  },
];

@NgModule({
  declarations: [
    EnforcementComponent,
    EnforcementEoListComponent,
    EnforcementEoNewComponent,
    EnforcementDeviceListComponent,
    EnforcementDeviceNewComponent,
    EnforcementRoutesComponent,
    RouteMapComponent,
    RouteStaffComponent,
    RouteListComponent,
    RouteDetailsComponent,
    EnforcementAssetListComponent,
    EnforcementAssetNewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSetupModule,
  ],
  entryComponents: [
    EnforcementEoNewComponent,
    EnforcementDeviceNewComponent,
    EnforcementAssetNewComponent,
    RouteStaffComponent,
  ]
})
export class EnforcementSetupModule { }

