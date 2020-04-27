import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {TreeviewModule} from 'ngx-treeview';

import {PromotionsComponent} from './components/promotions/promotions.component';
import {PromotionService} from './services/promotion.service';
import {PermissionGuard} from '../../core/guards/permission.guard';
import {PromotionDetailComponent} from './components/promotion-detail/promotion-detail/promotion-detail.component';
import { PromotionLocationComponent } from './components/promotion-detail/promotion-location/promotion-location.component';
import { PromotionZoneComponent } from './components/promotion-detail/promotion-zone/promotion-zone.component';
import { PromotionValidityComponent } from './components/promotion-detail/promotion-validity/promotion-validity.component';
import {SharedModule} from '../../shared/shared.module';
import {PromotionValuesComponent} from './components/promotion-detail/promotion-values/promotion-values.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: PromotionsComponent, canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
        feature: 'tariff_promotion',
        type: 'is_view'
      }
    }
  },
  { path: 'new', component: PromotionDetailComponent, canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
        feature: 'tariff_promotion',
        type: 'is_view'
      }
    }
  },
  { path: ':id', component: PromotionDetailComponent, canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
        feature: 'tariff_promotion',
        type: 'is_view'
      }
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TreeviewModule.forRoot(),
    SharedModule,
  ],
  declarations: [
    PromotionsComponent,
    PromotionDetailComponent,
    PromotionLocationComponent,
    PromotionZoneComponent,
    PromotionValuesComponent,
    PromotionValidityComponent,
  ],
  providers: [
    PromotionService
  ]
})
export class PromotionModule { }
