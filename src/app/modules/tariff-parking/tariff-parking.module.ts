import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { PermissionGuard } from '../../core/guards/permission.guard';
import { AuthGuard } from '../../core/guards/auth.guard';
import { TariffParkingOverviewComponent } from './components/tariff-parking-overview/tariff-parking-overview.component';
import { TariffParkingDetailsComponent } from './components/tariff-parking-details/tariff-parking-details.component';
import { TariffIntervalService } from './services/tariff-interval.service';
import { TariffSegmentService } from './services/tariff-segment.service';
import { TariffSegmentsTableComponent } from './components/tariff-segments-table/tariff-segments-table.component';
import { TariffPriceSimulationModalComponent } from './components/tariff-price-simulation-modal/tariff-price-simulation-modal.component';
import { TariffParkingBasicComponent } from './components/tariff-parking-details/tariff-parking-basic/tariff-parking-basic.component';
import { TariffParkingBasicService } from './services/tariff-parking-basic.service';

const routes: Routes = [
  { path: '', component: TariffParkingOverviewComponent, canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
        feature: 'tariff_parking',
        type: 'is_view'
      }
    }
  },
  { path: 'details/new', component: TariffParkingDetailsComponent, canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
        feature: 'tariff_parking',
        type: 'is_view'
      }
    }
  },
  { path: 'details/:id', component: TariffParkingDetailsComponent, canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
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
    SharedModule,
  ],
  declarations: [
    TariffParkingOverviewComponent,
    TariffParkingDetailsComponent,
    TariffSegmentsTableComponent,
    TariffPriceSimulationModalComponent,
    TariffParkingBasicComponent,
  ],
  providers: [
    TariffIntervalService,
    TariffSegmentService,
    TariffParkingBasicService
  ],
  entryComponents: [
    TariffPriceSimulationModalComponent,
  ]
})
export class TariffParkingModule { }
