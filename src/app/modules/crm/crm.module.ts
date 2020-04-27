import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { NgxGalleryModule } from 'ngx-gallery';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { AuthGuard } from '../../core/guards/auth.guard';
import { JobComponent } from './components/job/job.component';
import { ContraventionComponent } from './components/contravention/contravention.component';
import { ContraventionDetailsComponent } from './components/contravention/contravention-details/contravention-details.component';
import { ViolationMapModalComponent } from './components/contravention/violation-map-modal/violation-map.component';
import { JobViolationModalComponent } from './components/job/violation-map-modal/violation-map.component';
import { JobDetailsComponent } from './components/job/job-details/job-details.component';

const routes: Routes = [
    {
        path: 'job', component: JobComponent, canActivate: [PermissionGuard, AuthGuard],
        data: {
            permission: {
                feature: 'crm_jobs_view',
                type: 'is_view'
            }
        }
    },
    {
        path: 'contravention', component: ContraventionComponent, canActivate: [PermissionGuard, AuthGuard],
        data: {
            permission: {
                feature: 'crm_contravention_view',
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
        NgbModule.forRoot(),
        NgxGalleryModule
    ],
    declarations: [
        JobComponent,
        ContraventionComponent,
        ContraventionDetailsComponent,
        JobDetailsComponent,
        ViolationMapModalComponent,
        JobViolationModalComponent
    ],
    entryComponents: [
        ContraventionDetailsComponent,
        JobDetailsComponent,
        ViolationMapModalComponent,
        JobViolationModalComponent
    ]
})
export class CRMModule { }