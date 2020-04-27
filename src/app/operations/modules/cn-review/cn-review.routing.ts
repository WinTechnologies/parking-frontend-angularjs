import { Routes } from '@angular/router';
import { CnReviewComponent } from './cn-review.component';
import { PermissionGuard } from '../../../core/guards/permission.guard';
import { AuthGuard } from '../../../core/guards/auth.guard';

export const CnReviewRouting: Routes = [
  {
    path: 'cn-review',
    component: CnReviewComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      title: 'CN Review',
      breadcrumb: 'CN Review',
      permission: {
        feature: 'enforcement_cn_review',
        type: 'is_view'
      }
    }
  },
];
