import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import {PermissionGuard} from 'app/core/guards/permission.guard';
import {AuthGuard} from 'app/core/guards/auth.guard';

import { CommonSetupModule } from '../common-setup/common-setup.module';

import { CarparkSetupComponent } from './components/carpark-setup.component';
import { CarparkProjectZoneComponent } from './components/project-zone/carpark-project-zone.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { CarparkParkingComponent } from './components/carpark-parking/carpark-parking.component';
import { CarparkLevelComponent } from './components/carpark-level/carpark-level.component';
import { CarparkZoneComponent } from './components/carpark-zone/carpark-zone.component';
import { GateComponent } from './components/gate/gate.component';
import { LaneComponent } from './components/lane/lane.component';
import { ParkSpaceComponent } from './components/park-space/park-space.component';
import { CarparkAssetComponent } from './components/carpark-asset/carpark-asset.component';

import { CarparkDataService } from './services/carpark-data.service';
import { TerminalService } from './services/terminal.service';
import { GateService } from './services/gate.service';
import { LaneService } from './services/lane.service';
import { ParkSpaceService } from './services/park-space.service';
import { CarparkService } from './services/carpark.service';
import { CarparkLevelService } from './services/carpark-level.service';
import { CarparkZoneService } from './services/carpark-zone.service';
import { CarparkAssetsService } from './services/carpark-assets.service';

const routes: Routes = [
  {
    path: '',
    component: CarparkSetupComponent,
    canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
        // TODO: Permission
        feature: 'tariff_parking',
        type: 'is_view'
      }
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSetupModule,
  ],
  declarations: [
    CarparkSetupComponent,
    CarparkProjectZoneComponent,
    TerminalComponent,
    CarparkParkingComponent,
    CarparkLevelComponent,
    CarparkZoneComponent,
    GateComponent,
    LaneComponent,
    ParkSpaceComponent,
    CarparkAssetComponent,
  ],
  providers: [
    CarparkDataService,
    TerminalService,
    GateService,
    LaneService,
    ParkSpaceService,
    CarparkService,
    CarparkLevelService,
    CarparkZoneService,
    CarparkAssetsService,
  ],
  entryComponents: [
  ]
})
export class CarparkSetupModule { }

