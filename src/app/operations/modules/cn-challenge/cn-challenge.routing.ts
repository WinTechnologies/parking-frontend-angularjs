import { Routes } from '@angular/router';
import { CnChallengeComponent } from './cn-challenge.component';
import { PermissionGuard } from '../../../core/guards/permission.guard';
import { AuthGuard } from '../../../core/guards/auth.guard';

export const CnChallengeRouting: Routes = [
  {
    path: 'cn-challenge',
    component: CnChallengeComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      title: 'CN Challenge',
      breadcrumb: 'CN Challenge',
      permission: {
        feature: 'enforcement_cn_challenge',
        type: 'is_view'
      }
    }
  },
];
