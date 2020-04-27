import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule} from '../../shared/shared.module';

import { PermissionGuard } from '../../core/guards/permission.guard';
import { AuthGuard } from '../../core/guards/auth.guard';
import { DefaultValueTypesComponent } from './components/default-value-types/default-value-types.component';
import { DefaultValueTypeComponent } from './components/default-value-type/default-value-type.component';
import { DefaultValueDetailModalComponent } from './components/default-value-detail-modal/default-value-detail-modal.component';
import { DefaultValueService } from './services/default-value.service';

const routes: Routes = [
  { path: '', component: DefaultValueTypesComponent, canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
        feature: 'setting_default_value',
        type: 'is_view'
      }
    }
  },
  { path: ':type', component: DefaultValueTypeComponent, canActivate: [PermissionGuard, AuthGuard],
    data: {
      permission: {
        feature: 'setting_default_value',
        type: 'is_view'
      }
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    DefaultValueTypesComponent,
    DefaultValueTypeComponent,
    DefaultValueDetailModalComponent
  ],
  providers: [
    DefaultValueService
  ],
  entryComponents: [
    DefaultValueDetailModalComponent,
  ]
})
export class DefaultValueModule { }
