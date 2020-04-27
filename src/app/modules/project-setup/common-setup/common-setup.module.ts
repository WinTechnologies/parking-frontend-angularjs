import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';

// Common components, services for OnStreet, Carpark setup module
import {OnstreetProjectZoneComponent} from './components/onstreet/project-zone/onstreet-project-zone.component';
import {ParkingComponent} from './components/onstreet/onstreet-parking/parking.component';
import {ParkingImageViewComponent} from './components/onstreet/onstreet-parking/parking-image-view/parking-image-view.component';
import {AssignedProjectsResolve} from '../../../components/projects/services/assigned-projects.resolve';
import {PgParkingsService} from './services/onstreet/parking.service';
import {PgProjectZoneService} from './services/onstreet/project-zone.service';
import {PgProjectOpenLandService} from './services/onstreet/project-openland.service';
import {NotificationService} from './services/onstreet/notification.service';

// Common components, services for Enforcement setup module
import { TariffEnforcementContainerComponent } from 'app/components/tariff-enforcement/tariff-enforcement-container.component';
import { TariffEnforcementComponent } from 'app/components/tariff-enforcement/tariff-enforcement.component';
import { PhotoEditorComponent } from 'app/components/tariff-enforcement/enforcement-violations/photo-editor/photo-editor.component';
import { EnforcementViolationsComponent } from 'app/components/tariff-enforcement/enforcement-violations/enforcement-violations.component';
import { EnforcementGroupsComponent } from 'app/components/tariff-enforcement/enforcement-groups/enforcement-groups.component';
import { EscalationsListComponent } from 'app/components/tariff-enforcement/enforcement-escalations/escalations-list/escalations-list.component';
import { GroupDetailsComponent } from 'app/components/tariff-enforcement/enforcement-groups/group-details/group-details.component';
import { ListGroupsComponent } from 'app/components/tariff-enforcement/enforcement-groups/list-groups/list-groups.component';
import { PopupViolationsComponent } from 'app/components/tariff-enforcement/enforcement-groups/popup-violations/popup-violations.component';
import { AssignmentDetailsComponent } from 'app/components/tariff-enforcement/enforcement-groups/assignment-details/assignment-details.component';
import { AssignmentViolationDetailsComponent } from 'app/components/tariff-enforcement/enforcement-groups/assignment-details/assignment-violation-details/assignment-violation-details.component';
import { AssignmentScheduleComponent } from 'app/components/tariff-enforcement/assignment-schedule/assignment-schedule.component';
import { ViolationDetailsDialogComponent } from 'app/components/tariff-enforcement/enforcement-violations/violation-details-dialog/violation-details-dialog.component';
import { EscalationsNewDialogComponent } from 'app/components/tariff-enforcement/enforcement-escalations/escalations-new-dialog/escalations-new-dialog.component';
import { PgEscalationService } from 'app/components/tariff-enforcement/enforcement-escalations/services/escalation.service';

@NgModule({
  declarations: [
    OnstreetProjectZoneComponent,
    ParkingComponent,
    ParkingImageViewComponent,

    TariffEnforcementContainerComponent,
    TariffEnforcementComponent,
    PhotoEditorComponent,
    EnforcementViolationsComponent,
    EnforcementGroupsComponent,
    EscalationsListComponent,
    GroupDetailsComponent,
    ListGroupsComponent,
    PopupViolationsComponent,
    AssignmentDetailsComponent,
    AssignmentViolationDetailsComponent,
    AssignmentScheduleComponent,
    ViolationDetailsDialogComponent,
    EscalationsNewDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
  ],
  providers: [
    AssignedProjectsResolve,
    PgParkingsService,
    PgProjectZoneService,
    PgProjectOpenLandService,
    PgEscalationService,
    NotificationService,
  ],
  entryComponents: [
    ParkingImageViewComponent,

    PhotoEditorComponent,
    PopupViolationsComponent,
    ViolationDetailsDialogComponent,
    EscalationsNewDialogComponent,
  ],
  exports: [
    SharedModule,
    RouterModule,

    OnstreetProjectZoneComponent,
    ParkingComponent,
    ParkingImageViewComponent,

    TariffEnforcementContainerComponent,
    TariffEnforcementComponent,
    PhotoEditorComponent,
    EnforcementViolationsComponent,
    EnforcementGroupsComponent,
    EscalationsListComponent,
    GroupDetailsComponent,
    ListGroupsComponent,
    PopupViolationsComponent,
    AssignmentDetailsComponent,
    AssignmentViolationDetailsComponent,
    AssignmentScheduleComponent,
    ViolationDetailsDialogComponent,
    EscalationsNewDialogComponent,
  ]
})
export class CommonSetupModule { }
