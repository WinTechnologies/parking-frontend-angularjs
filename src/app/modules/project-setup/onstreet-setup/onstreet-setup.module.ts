import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {PermissionGuard} from 'app/core/guards/permission.guard';
import {AuthGuard} from 'app/core/guards/auth.guard';
import {CommonSetupModule} from '../common-setup/common-setup.module';

import {OnStreetComponent} from './components/on-street.component';
import {ParkingMeterComponent} from './components/parking-meter/parking-meter.component';
import {SignageComponent} from './components/signage/signage.component';
import {OpenLandComponent} from './components/open-land/open-land.component';

const routes: Routes = [
  {
    path: '',
    component: OnStreetComponent,
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
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSetupModule,
  ],
  declarations: [
    OnStreetComponent,
    ParkingMeterComponent,
    SignageComponent,
    OpenLandComponent
  ],
  exports: [
    OnStreetComponent,
    ParkingMeterComponent,
    SignageComponent,
    OpenLandComponent,
  ]
})
export class OnstreetSetupModule { }
