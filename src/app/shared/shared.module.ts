import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Singleton Modules
import { TreeviewModule } from 'ngx-treeview';
import { Ng2FileInputModule, Ng2FileInputService } from 'ng2-file-input';
import { DndModule } from 'ng2-dnd';
import { ToastrModule } from 'ngx-toastr';
import { GridsterModule } from 'angular2gridster';
import { TranslateModule } from '@ngx-translate/core';

import { FullCalendarModule } from 'ng-fullcalendar';
import { MaterialModule } from './material.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageCropperModule } from 'ng2-img-cropper';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { FlashMessagesModule, FlashMessagesService } from 'angular2-flash-messages';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { ColorPickerModule } from 'ngx-color-picker';
import { ChartsModule } from 'ng2-charts';
import { DragScrollModule } from 'ngx-drag-scroll';
import { AccordionModule } from 'primeng/accordion'; // accordion and accordion tab
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/primeng';
import { NvD3Module } from 'ng2-nvd3';

import { SelectionWeekdayComponent } from './components/selection-weekday/selection-weekday.component';
import { TimelineViewComponent } from './components/timeline-view/timeline-view.component';
import { ScheduleCalendarComponent } from './components/schedule-calendar/schedule-calendar.component';
import { PermissionFeatureComponent } from './components/permission-feature/permission-feature.component';
import { MapClusterViewComponent } from './components/map-cluster-view/map-cluster-view.component';
import { MapviewNewComponent } from './components/mapview-new/mapview-new.component';
import { ScrollerComponent } from './components/scroller/scroller.component';
import { ProductsComponent } from './components/tariff/products/products.component';
import { RangeSliderComponent } from './components/tariff/range-slider/range-slider.component';
import { TimeIntervalsComponent } from './components/tariff/time-intervals/time-intervals.component';
import { SearchPipe } from './pipes/search.pipe';
import { SearchFilterPipe } from './pipes/search-filter.pipe';
import { TimeFormat } from './pipes/time-format.pipe';
import { OrgChartComponent } from './components/org-chart/org-chart.component';
import { TimeRangeSliderComponent } from './components/time-range-slider/time-range-slider.component';
import { InputDateFormatDirective } from './directives/input-date-format.directive';
import { ProjectZonesSelectorComponent } from './components/project-zones-selector/project-zones-selector.component';
import { ParkingMapComponent } from './components/project-zones-selector/parking-map/parking-map.component';
import { TableColumnsEditModalComponent } from './components/table-columns-edit-modal/table-columns-edit-modal.component';
import { PopoverComponent } from './components/popover/popover.component';
import { MultipleSelectorComponent } from './components/multiple-selector/multiple-selector.component';
import { ListviewNewComponent } from './components/listview-new/listview-new.component';
import { NgxResizeWatcherDirective } from './directives/ngx-resize-watcher.directive';
import { TableColumnsEditDropDownComponent } from './components/table-columns-edit-dropdown/table-columns-edit-dropdown.component';
import { StylePaginatorDirective } from './directives/paginator.directive';
import { BarChartComponent } from './components/charts/bar-chart/bar-chart.component';
import { DoughnutChartComponent } from './components/charts/doughnut-chart/doughnut-chart.component';
import { LineChartComponent } from './components/charts/line-chart/line-chart.component';
import { PieChartComponent } from './components/charts/pie-chart/pie-chart.component';
import { TextChartComponent } from './components/charts/text-chart/text-chart.component';
import { MapStatusComponent } from './components/map/map-status/map-status.component';
import { MapIntensityComponent } from './components/map/map-intensity/map-intensity.component';
import { MapTotalComponent } from './components/map/map-total/map-total.component';
import { MapTakenJobsComponent } from './components/map/map-taken-jobs/map-taken-jobs.component';
import { DataGridComponent } from './components/data-grid/data-grid.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FullCalendarModule,
    DragDropModule,
    NgxDatatableModule,
    FlexLayoutModule,
    FlashMessagesModule,
    NvD3Module,
    Ng2ImgMaxModule,
    AmazingTimePickerModule,
    AccordionModule,
    CalendarModule,
    PanelModule,
    ButtonModule,
    RadioButtonModule,
    ChartsModule,
    DragScrollModule,
    ColorPickerModule,
    ImageCropperModule,
    Ng2SearchPipeModule,
    Ng2TelInputModule,
    TreeviewModule.forRoot(),
    Ng2FileInputModule.forRoot(),
    DndModule.forRoot(),
    ToastrModule.forRoot({
      preventDuplicates: true,
      countDuplicates: true,
    }),
    GridsterModule.forRoot(),
  ],
  declarations: [
    DataGridComponent,
    BarChartComponent,
    DoughnutChartComponent,
    LineChartComponent,
    PieChartComponent,
    TextChartComponent,
    MapStatusComponent,
    MapIntensityComponent,
    MapTotalComponent,
    MapTakenJobsComponent,
    SelectionWeekdayComponent,
    TimelineViewComponent,
    ScheduleCalendarComponent,
    PermissionFeatureComponent,
    MapClusterViewComponent,
    MapviewNewComponent,
    ScrollerComponent,
    ProductsComponent,
    RangeSliderComponent,
    TimeIntervalsComponent,
    SearchPipe,
    SearchFilterPipe,
    TimeFormat,
    OrgChartComponent,
    TimeRangeSliderComponent,
    InputDateFormatDirective,
    PopoverComponent,
    MultipleSelectorComponent,
    ParkingMapComponent,
    ProjectZonesSelectorComponent,
    TableColumnsEditModalComponent,
    ListviewNewComponent,
    NgxResizeWatcherDirective,
    TableColumnsEditDropDownComponent,
    StylePaginatorDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TreeviewModule,
    Ng2FileInputModule,
    DndModule,
    ToastrModule,
    GridsterModule,
    DragDropModule,
    NgxDatatableModule,
    FlexLayoutModule,
    FlashMessagesModule,
    NvD3Module,
    Ng2ImgMaxModule,
    AmazingTimePickerModule,
    FullCalendarModule,
    AccordionModule,
    CalendarModule,
    PanelModule,
    ButtonModule,
    RadioButtonModule,
    ChartsModule,
    DragScrollModule,
    ColorPickerModule,
    ImageCropperModule,
    Ng2SearchPipeModule,
    Ng2TelInputModule,

    DataGridComponent,
    BarChartComponent,
    DoughnutChartComponent,
    LineChartComponent,
    PieChartComponent,
    TextChartComponent,
    MapStatusComponent,
    MapIntensityComponent,
    MapTotalComponent,
    MapTakenJobsComponent,
    SelectionWeekdayComponent,
    TimelineViewComponent,
    ScheduleCalendarComponent,
    PermissionFeatureComponent,
    MapClusterViewComponent,
    MapviewNewComponent,
    ScrollerComponent,
    ProductsComponent,
    SearchPipe,
    SearchFilterPipe,
    TimeFormat,
    OrgChartComponent,
    TimeRangeSliderComponent,
    InputDateFormatDirective,
    ProjectZonesSelectorComponent,
    PopoverComponent,
    MultipleSelectorComponent,
    ListviewNewComponent,
    NgxResizeWatcherDirective,
    TableColumnsEditDropDownComponent,
    StylePaginatorDirective,
    TranslateModule
  ],
  providers: [
    FlashMessagesService,
    Ng2FileInputService,
  ],
  entryComponents: [
    TableColumnsEditModalComponent,
    PopoverComponent,
    MultipleSelectorComponent
  ],
})
export class SharedModule {
}
