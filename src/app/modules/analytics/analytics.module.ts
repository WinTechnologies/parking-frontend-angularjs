import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { AnalyticsService } from './services/analytics.service';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { LibraryGroupsComponent } from './components/analytics/library-groups/library-groups.component';
import { MapChartComponent } from './components/analytics-chart/map-chart/map-chart.component';
import { AnalyticsChartComponent } from './components/analytics-chart/analytics-chart.component';
import { ChartDetailsModalComponent } from './components/chart-details-modal/chart-details-modal.component';
import { ChartSettingsModalComponent } from './components/chart-settings-modal/chart-settings-modal.component';
import { AnalyticsCreateTabModalComponent } from './components/analytics-create-tab-modal/analytics-create-tab-modal.component';
import { ReportChartComponent } from './components/report-chart/report-chart.component';
import { ReportDetailComponent} from './components/report-detail/report-detail.component';
import { AnalyticsLibraryComponent } from './components/analytics/analytics-library/analytics-library.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
  ],
  declarations: [
    AnalyticsComponent,
    AnalyticsLibraryComponent,
    LibraryGroupsComponent,
    AnalyticsChartComponent,
    ChartDetailsModalComponent,
    ChartSettingsModalComponent,
    MapChartComponent,
    AnalyticsCreateTabModalComponent,
    ReportChartComponent,
    ReportDetailComponent,
  ],
  exports: [
    AnalyticsComponent,
  ],
  providers: [
    AnalyticsService,
  ],
  entryComponents: [
    ChartDetailsModalComponent,
    ChartSettingsModalComponent,
    AnalyticsCreateTabModalComponent,
  ]
})
export class AnalyticsModule { }
