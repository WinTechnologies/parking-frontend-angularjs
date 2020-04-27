import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { PermissionGuard } from '../../core/guards/permission.guard';
import { AssignmentListComponent } from './components/assignment-list/assignment-list.component';
import { AssignmentDetailComponent } from './components/assignment-detail/assignment-detail.component';
import { AssignmentDetailStaffComponent } from './components/assignment-detail/assignment-detail-staff/assignment-detail-staff.component';
import { AssignmentEmployeesModalComponent } from './components/assignment-employees-modal/assignment-employees-modal.component';
import { AssignmentDetailOrgChartComponent } from './components/assignment-detail/assignment-detail-org-chart/assignment-detail-org-chart.component';
import { AssignmentService } from './services/assignment.service';

const routes: Routes = [
  { path: '', component: AssignmentListComponent, canActivate: [PermissionGuard],
    data: {
      permission: {
        feature: 'hr_assignment',
        type: 'is_view'
      }
    }
  },
  { path: ':id', component: AssignmentDetailComponent, canActivate: [PermissionGuard],
    data: {
      permission: {
        feature: 'hr_assignment',
        type: 'is_view'
      }
    }
  },
];

@NgModule({
  declarations: [
    AssignmentListComponent,
    AssignmentDetailComponent,
    AssignmentDetailStaffComponent,
    AssignmentEmployeesModalComponent,
    AssignmentDetailOrgChartComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  entryComponents: [
    AssignmentEmployeesModalComponent
  ],
  providers: [
    AssignmentService,
  ]
})
export class AssignmentModule { }
