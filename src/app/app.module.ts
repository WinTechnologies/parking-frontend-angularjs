import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { GestureConfig, DateAdapter, MAT_DATE_LOCALE } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Singleton Modules
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderConfig, NgxUiLoaderHttpModule, NgxUiLoaderModule, POSITION, SPINNER } from 'ngx-ui-loader';
import {MqttModule} from 'ngx-mqtt';

import { RoutingModule } from './routing.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { environment } from '../environments/environment';

import 'd3';
import 'nvd3';

import { AppComponent } from './app.component';
import { FilterdialogComponent } from './components/generalview/filterdialog/filterdialog.component';
import { GeneralviewComponent } from './components/generalview/generalview.component';
import { GeneralviewFilterService } from './components/generalview/generalview-filter.service';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ResetPasswordComponent } from './components/forgot-password/reset-password.component';
import { MapviewComponent } from './components/mapview/mapview.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AlertdialogComponent } from './components/alertdialog/alertdialog.component';
import { RedirectDialogComponent } from './components/redirect-dialog/redirect-dialog.component';
import { RangeSliderComponent } from './components/range-slider/range-slider.component';

import { AvatarEditorComponent } from './components/modals/avatar-editor/avatar-editor.component';
import { SitesSelectorComponent } from './components/modals/sites-selector/sites-selector.component';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { ListCityResolve } from './components/heatmap/list-city.resolve';

import { AssetsComponent } from './components/assets/assets.component';
import { AssetNewModelComponent } from './components/assets/asset-new-model/asset-new-model.component';
import { AssetNewTypeModalComponent } from './components/assets/asset-new-type-modal/asset-new-type-modal.component';
import { AssetSelectComponent } from './components/assets/asset-select/asset-select.component';
import { PgAssetService } from './components/assets/services/assets.service';
import { AssetCreateModelComponent } from './components/assets/asset-create-model/asset-create-model.component';
import { PgAssetModelsService } from './components/assets/services/assets-models.service';
import { AssetNewTypeComponent } from './components/assets/asset-new-type/asset-new-type.component';
import { AssetFieldDialogComponent } from './components/assets/asset-field-dialog/asset-field-dialog.component';
import { AssetSelectModelComponent } from './components/assets/asset-select-model/asset-select-model.component';
import { PgAssetTypeService } from './components/assets/services/asset-type.service';

import { EmployeesTabComponent } from './components/employees/employees-tab.component';
import { EmployeeListComponent } from './components/employees/employee-list/employee-list.component';
import { PgEmployeeService } from './components/employees/employee.service';
import { EmployeeDetailsComponent } from './components/employees/employee-details/employee-details.component';
import { EmployeePerformanceComponent } from './components/employees/employee-performance/employee-performance.component';
import { UpdateEmployeeComponent } from './components/employees/update-employee/update-employee.component';
import { AddProjectComponent } from './components/employees/add-project/add-project.component';
import { AddProjectService} from './components/employees/add-project/add-project.service';
import { AddProjectDialogComponent } from './components/employees/employee-details/add-project-dialog/add-project-dialog.component';
import { EmployeePermissionComponent } from './components/employees/employee-permission/employee-permission.component';
import { PgEmployeeWpService } from './components/employees/employee-wp.service';
import { AddEmployeeComponent } from './components/employees/add-employee/add-employee.component';

import { WorkplanListComponent } from './components/workplans/workplan-list/workplan-list.component';
import { WorkplanSelectPopupComponent } from './components/workplans/workplan-select-popup/workplan-select-popup.component';
import { WorkplansTabComponent } from './components/workplans/workplans-tab.component';
import { WorkplanNewComponent } from './components/workplans/workplan-new/workplan-new.component';
import { PgWorkplanService } from './components/workplans/workplan.service';
import { PgExceptionService } from './components/workplans/workplan-new/exceptions/exceptions.service';
import { PgReoccuringService } from './components/workplans/workplan-new/reoccurings/reoccurings.service';
import { WorkplanDetailsComponent } from './components/workplans/workplan-details/workplan-details.component';
import { AssignedEmployeesListComponent } from './components/workplans/workplan-details/assigned-employees-list/assigned-employees-list.component';
import { AssignedEmployeeNewComponent } from './components/workplans/workplan-details/assigned-employee-new/assigned-employee-new.component';
import { ExceptionNewComponent } from './components/workplans/workplan-new/exceptions/exception-new/exception-new.component';
import { ExceptionViewComponent } from './components/workplans/workplan-new/exceptions/exception-view/exception-view.component';
import { ReoccuringNewComponent } from './components/workplans/workplan-new/reoccurings/reoccuring-new/reoccuring-new.component';
import { ReoccuringViewComponent } from './components/workplans/workplan-new/reoccurings/reoccuring-view/reoccuring-view.component';

import { ProjectNewComponent } from './components/projects/project-new/project-new.component';
import { PgClientsService } from './components/projects/project-new/clients/clients.service';
import { PgKeydatesService } from './components/projects/project-new/keydates/keydates.service';
import { KeydateListComponent } from './components/projects/project-new/keydates/keydate-list/keydate-list.component';
import { KeydateNewComponent } from './components/projects/project-new/keydates/keydate-new/keydate-new.component';
import { ClientListComponent } from './components/projects/project-new/clients/client-list/client-list.component';
import { ClientNewComponent } from './components/projects/project-new/clients/client-new/client-new.component';
import { ActivityNewComponent } from './components/projects/project-new/activity/activity-new/activity-new.component';

import { ProjectListComponent } from './components/projects/project-list/project-list.component';
import { ProjectInfoComponent } from './components/projects/project-list/project-info/project-info.component';
import { ProductivityComponent } from './components/projects/project-list/productivity/productivity.component';
import { PgProjectsService } from './components/projects/services/projects.service';
import { PredictionComponent } from './components/projects/project-list/productivity/prediction/prediction.component';
import { IncentiveDialogComponent } from './components/projects/project-list/productivity/incentive/incentive-dialog/incentive-dialog.component';
import { IncentiveListComponent } from './components/projects/project-list/productivity/incentive/incentive-list/incentive-list.component';
import { PgActEnforcementIncentiveService } from './components/projects/project-list/productivity/incentive/services/act-enforcement-incentive.service';
import { PgProjectActivityService } from './components/projects/services/project-activity.service';
import { PgProjectEmployeeService } from './components/projects/services/project-employee.service';
import { PgProjectDashboardService } from './components/projects/services/project-dashboard.service';
import { ProjectDashboardComponent } from './components/projects/project-list/project-dashboard/project-dashboard.component';
import { WidgetOnStreetComponent } from './components/projects/project-list/project-dashboard/widget-on-street/widget-on-street.component';
import { WidgetCarParkComponent } from './components/projects/project-list/project-dashboard/widget-car-park/widget-car-park.component';
import { WidgetEnforcementComponent } from './components/projects/project-list/project-dashboard/widget-enforcement/widget-enforcement.component';
import { WidgetElementUniversalComponent } from './components/projects/project-list/project-dashboard/widget-elements/widget-element-universal/widget-element-universal.component';
import { WidgetElementChartComponent } from './components/projects/project-list/project-dashboard/widget-elements/widget-element-chart/widget-element-chart.component';
import { WidgetElementScaleComponent } from './components/projects/project-list/project-dashboard/widget-elements/widget-element-scale/widget-element-scale.component';
import { WidgetElementTableComponent } from './components/projects/project-list/project-dashboard/widget-elements/widget-element-table/widget-element-table.component';
import { WidgetElementUniversalAdvancedComponent } from './components/projects/project-list/project-dashboard/widget-elements/widget-element-universal-advanced/widget-element-universal-advanced.component';
import { PgActEnforcementPredictionService } from './components/projects/project-list/productivity/prediction/service/act-enforcement-prediction.service';
import { PgActEnforcementIncentiveBandService } from './components/projects/project-list/productivity/incentive/incentive-dialog/service/act-enforcement-incentive-band.service';
import { ProjectAllComponent } from './components/projects/project-list/project-all/project-all.component';
import { ProjectListService } from './components/projects/services/project-list.service';
import { ProjectListModalComponent } from './components/projects/project-list/project-list-modal/project-list-modal.component';
import { ProjectListModalService } from './components/projects/services/project-list-modal.service';
import { PgVatService } from './components/projects/services/vat.service';

import { PgProjectRouteService } from './components/enforcement/services/project-route.service';
import { EmployeeInfoComponent } from './components/employees/employee-info/employee-info.component';

import { ValueAddedListComponent } from './components/value-added/value-added-list/value-added-list.component';
import { ValueAddedNewComponent } from './components/value-added/value-added-new/value-added-new.component';
import { BundleNewComponent } from './components/value-added/bundle-new/bundle-new.component';
import { ValueAddedScheduleComponent } from './components/value-added/value-added-new/value-added-schedule/value-added-schedule.component';
import { PgValueAddedService } from './components/value-added/services/value-added.service';
import { ServiceListSelectionComponent } from './components/value-added/bundle-new/service-list-select/service-list-select.component';
import { PgBundleService } from './components/value-added/services/bundle.service';
import { PgBundleValueAddedService } from './components/value-added/services/bundle-value-add.service';
import { ConfirmationDialogService } from './shared/components/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';

import { PgListTypeNoteService } from './components/notes/service/list-type-note.service';
import { PgNoteService } from './components/notes/service/note.service';
import { NotesComponent } from './components/notes/notes.component';

import { CoreService } from './services/core.service';
import { ContraventionService } from './services/contravention.service';
import { CountriesService } from './services/countries.service';
import { EscalationRuleService } from './services/escalation-rule.service';
import { JobService } from './services/job.service';
import { MapService } from './services/map.service';
import { ProjectService } from './services/project.service';
import { PerformanceService } from './services/performance.service';
import { ArcgisService } from './services/arcgis.service';
import { MatTableDefinitionService } from './services/mat-table-definition.service';
import { SiteService } from './services/site.service';
import { StatService } from './services/stat.service';
import { SocketService } from './services/socket.service';
import { TeamsService } from './services/teams.service';
import { UploadService } from './services/upload.service';
import { UserService } from './services/user.service';
import { UserTypeService } from './services/userType.service';
import { ValidateService } from './services/validate.service';
import { ViolationService } from './services/violation.service';
import { ZoneService } from './services/zone.service';
import { EventCalendarScheduleService } from './services/event-calendar-schedule.service';
import { GroupService } from './services/group.service';
import { LoaderService } from './services/loader.service';
import { CurrentUserService } from './services/current-user.service';
import { PgOrgChartService } from './services/org-chart.service';
import { PermissionSharedService } from './services/permission-shared.service';
import { HhdTrackingService } from './services/hhd-tracking.service';
import { MatTableFilterService } from './services/mat-table-filter.service';
import { CommonService } from './services/common.service';
import { ListEnforcerStatusService } from './services/list-enforcer-status.service';
// ------------- change date format -------------------
import { DateFormat } from './services/date.format';
import { ProductService } from './services/product.service';
import { StorageService } from './services/storage.service';

// Feature Modules
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CommonSetupModule } from './modules/project-setup/common-setup/common-setup.module';
import { AdminModule } from './modules/admin/admin.module';
import { CarparkSetupModule } from './modules/project-setup/carpark-setup/carpark-setup.module';

// Operations Modules
import { OperationsModule } from './operations/operations.module';

import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

export const apiEndpoint = environment.apiBase;

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: '#2d404a',
  bgsPosition: POSITION.centerCenter,
  bgsSize: 40,
  bgsType: SPINNER.rectangleBounce,
  hasProgressBar: false,
  logoPosition: POSITION.centerCenter,
  logoSize: 120
};

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    HomeComponent,
    LoginComponent,
    ResetPasswordComponent,
    ProfileComponent,
    SidebarComponent,
    AvatarEditorComponent,
    SitesSelectorComponent,
    MapviewComponent,
    GeneralviewComponent,
    FilterdialogComponent,
    RangeSliderComponent,
    HeatmapComponent,

    UpdateEmployeeComponent,

    AssetsComponent,
    AssetSelectComponent,
    AssetSelectComponent,
    AssetNewModelComponent,
    AssetNewTypeComponent,
    AssetNewTypeModalComponent,
    AssetFieldDialogComponent,
    AssetSelectModelComponent,
    AssetCreateModelComponent,

    EmployeesTabComponent,
    EmployeeListComponent,
    EmployeeDetailsComponent,
    EmployeePermissionComponent,

    WorkplansTabComponent,
    WorkplanListComponent,
    WorkplanSelectPopupComponent,
    WorkplanDetailsComponent,
    WorkplanNewComponent,
    NotesComponent,
    ExceptionNewComponent,
    ExceptionViewComponent,
    ReoccuringNewComponent,
    ReoccuringViewComponent,

    ProjectNewComponent,
    KeydateListComponent,
    KeydateNewComponent,
    ClientListComponent,
    ClientNewComponent,
    ActivityNewComponent,

    ProjectListComponent,
    ProjectInfoComponent,
    ProductivityComponent,
    PredictionComponent,
    IncentiveDialogComponent,
    IncentiveListComponent,

    AssignedEmployeesListComponent,
    AssignedEmployeeNewComponent,
    AddEmployeeComponent,

    EmployeeInfoComponent,

    EmployeePerformanceComponent,
    ProjectDashboardComponent,
    WidgetOnStreetComponent,
    WidgetCarParkComponent,
    WidgetEnforcementComponent,
    WidgetElementUniversalComponent,
    WidgetElementChartComponent,
    WidgetElementScaleComponent,
    WidgetElementTableComponent,
    WidgetElementUniversalAdvancedComponent,
    ProjectAllComponent,
    ProjectListModalComponent,
    AlertdialogComponent,
    RedirectDialogComponent,
    AddProjectComponent,
    AddProjectDialogComponent,

    ValueAddedListComponent,
    ValueAddedNewComponent,
    ValueAddedScheduleComponent,
    BundleNewComponent,
    ServiceListSelectionComponent,
    ConfirmationDialogComponent
  ],

  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    /**
     * make sure that HttpClientModule is imported only once in root AppModule
     * Custom HTTPINTERCEPTOR - AuthInterceptor (that is defined in core module) isn't injected to common-setup module
     */
    HttpClientModule,
    RoutingModule,
    CoreModule,
    SharedModule,

    CarparkSetupModule,

    AnalyticsModule,
    CommonSetupModule,
    AdminModule,

    NgbModule.forRoot(),
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderHttpModule,
    MqttModule.forRoot(environment.mqttServer),

    // Operations Module
    OperationsModule,
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
    }),
  ],

  providers: [
    { provide: 'API_ENDPOINT', useValue: apiEndpoint },
    { provide: DateAdapter, useClass: DateFormat },
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    // { provide: MAT_DIALOG_DATA, useValue: [] },
    ValidateService,
    GroupService,
    UserService,
    SiteService,
    StatService,
    ZoneService,
    JobService,
    ContraventionService,
    UserTypeService,
    TeamsService,
    UploadService,
    CoreService,
    ProjectService,
    PerformanceService,
    ArcgisService,
    MatTableDefinitionService,
    DatePipe,
    SocketService,
    MapService,
    CountriesService,
    ViolationService,
    EscalationRuleService,
    EventCalendarScheduleService,
    StorageService,
    ProjectListService,
    ProjectListModalService,
    LoaderService,
    PermissionSharedService,

    PgAssetService,
    PgAssetModelsService,

    PgEmployeeService,
    PgWorkplanService,
    PgExceptionService,
    PgReoccuringService,

    PgNoteService,
    PgEmployeeWpService,
    PgProjectsService,
    PgClientsService,
    PgKeydatesService,
    PgProjectActivityService,
    PgProjectDashboardService,
    PgActEnforcementIncentiveService,
    PgActEnforcementIncentiveBandService,
    PgActEnforcementPredictionService,
    PgProjectEmployeeService,
    PgOrgChartService,
    PgProjectRouteService,
    PgListTypeNoteService,
    PgValueAddedService,
    PgBundleService,
    PgBundleValueAddedService,
    AddProjectService,
    CurrentUserService,
    PgAssetTypeService,
    PgVatService,
    ProductService,
    GeneralviewFilterService,
    ListCityResolve,
    HhdTrackingService,
    ConfirmationDialogService,
    MatTableFilterService,
    CommonService,
    ListEnforcerStatusService
  ],

  entryComponents: [
    AvatarEditorComponent,
    SitesSelectorComponent,
    FilterdialogComponent,
    AssetFieldDialogComponent,
    KeydateNewComponent,
    ClientNewComponent,
    ActivityNewComponent,
    IncentiveDialogComponent,
    AssetCreateModelComponent,
    AssetNewTypeModalComponent,
    ProjectListModalComponent,
    AlertdialogComponent,
    RedirectDialogComponent,
    UpdateEmployeeComponent,
    EmployeeDetailsComponent,
    AddProjectDialogComponent,
    EmployeeInfoComponent,
    WorkplanSelectPopupComponent,
    ConfirmationDialogComponent
  ],

  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(private dateAdapter: DateAdapter<Date>) {
    dateAdapter.setLocale('en-in'); // DD/MM/YYYY
    }
 }
