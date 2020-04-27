import * as moment from 'moment';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PgProjectDashboardService } from '../../services/project-dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PgProjectActivityService } from '../../services/project-activity.service';
import { ProjectActivity } from '../../models/project-activity.model';
import { EnforcementWidget, OnStreetWidget } from '../../models/widget.model';
import { Popover } from '../../../../shared/components/popover/popover.service';
import { MultipleSelectorComponent } from '../../../../shared/components/multiple-selector/multiple-selector.component';
import { StorageService } from '../../../../services/storage.service';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})

export class ProjectDashboardComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() projectId;

  enforcementWidget: EnforcementWidget;
  onStreetWidget: OnStreetWidget;
  carparkWidget: any;
  selectedDate = new Date();
  projectActivity: ProjectActivity;
  widgetGroups = [
    {id: 'has_on_street', label: 'On Street', enableWidgets: {}, availableWidgets: [
        {value: 'occupancy', label: 'PAID OCCUPANCY'},
        {value: 'spaces', label: 'SPACES'},
        {value: 'als', label: 'ALS'},
        {value: 'atv', label: 'ATV'},
        {value: 'payment', label: 'PAYMENT'},
        // {value: 'vio', label: 'VIOLATIONS'},
        {value: 'revenue', label: 'REVENUE'},
        {value: 'revenue_spaces', label: 'REVENUE / SPACES / 12M'},
        {value: 'pnd', label: 'PARKING METERS'},
      ], data: [], enabled: false},
    {id: 'has_car_park', label: 'Car Park', enableWidgets: {}, availableWidgets: [
        {value: 'po', label: 'PAID OCCUPANCY'},
        /*{value: 'spaces', label: 'SPACES'},*/
        {value: 'als', label: 'ALS'},
        {value: 'atv', label: 'ATV'},
        {value: 'atv_total', label: 'ATV Total'},
        {value: 'payment', label: 'PAYMENT'},
        {value: 'revenue', label: 'REVENUE'},
        // {value: 'revenuePerSpace', label: 'REVENUE/SPACES/12M'},
        {value: 'APM', label: 'APMs'},
        {value: 'Barrier', label: 'BARRIERS'},
        {value: 'TDispenser', label: 'DISPENSERS'},
        {value: 'TVerifier', label: 'VERIFIERS'},
      ], data: [], enabled: false},
    {id: 'has_enforcement', label: 'Enforcement', enableWidgets: {}, availableWidgets: [
        {value: 'eo', label: 'ENFORCERS'},
        {value: 'trucks', label: 'TOW TRUCKS'},
        {value: 'clamp', label: 'CLAMP'},
        {value: 'atv_clamped', label: 'ATV Clamp'},
        {value: 'atv_towed', label: 'ATV Tow'},
        {value: 'eo_info', label: 'Issued CN'},
        {value: 'tow_info', label: 'Towed'},
        {value: 'clamp_info', label: 'Clamped'},
        // {value: 'gap', label: 'GAP Analysis'},
      ], data: [], enabled: false},
  ];

  constructor(
    private pgProjectDashboardService: PgProjectDashboardService,
    private projectActivityService: PgProjectActivityService,
    private storageService: StorageService,
    private popper: Popover
  ) { }

  async ngOnInit() {
    try {
      this.onDatePickerChange();
      this.getProjectActivity();
      this.setUpWidgetOptions();
    } finally {
    }
  }

  onDatePickerChange() {
    const selectedDateMoment = moment(this.selectedDate);
    this.pgProjectDashboardService.get({ day: selectedDateMoment.format('YYYY-MM-DD'), project_id: this.projectId })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(widgets => {
          if (widgets) {
            this.enforcementWidget = widgets.enforcement;
            this.onStreetWidget = widgets.onStreet;
            this.carparkWidget = widgets.carpark;

            this.widgetGroups[0].data = widgets.onStreet;
            this.widgetGroups[1].data = widgets.carpark;
            this.widgetGroups[2].data = widgets.enforcement;
          }
        });
  }

  getProjectActivity() {
    if (this.projectId) {
      this.projectActivityService.get({project_id: this.projectId})
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
        if (res.length) {
          this.projectActivity = res[0];

          this.widgetGroups.forEach((widgetGroup) => {
            widgetGroup.enabled = !!(res[0][widgetGroup.id]);
          });
        }
      });
    }
  }

  setUpWidgetOptions() {
    this.widgetGroups.forEach((widgetGroup) => {
      const enableWidgets = this.storageService.get('enable_widgets_' + widgetGroup.id);
      if (!enableWidgets) {
        widgetGroup.availableWidgets.forEach((availableWidget) => {
          widgetGroup.enableWidgets[availableWidget.value] = true;
        });
      } else {
        widgetGroup.enableWidgets = enableWidgets;
      }
    });
  }

  show(origin, widgetGroup) {
    const ref = this.popper.open({
      content: MultipleSelectorComponent,
      origin,
      width: '250px',
      data: {
        label: widgetGroup.label,
        enabled: widgetGroup.enableWidgets,
        available: widgetGroup.availableWidgets
      }
    });

    ref.afterClosed$.subscribe(res => {
    });

    ref.afterSelected$.subscribe(res => {
      widgetGroup.enableWidgets = Object.assign({}, res.data);
      this.storageService.save('enable_widgets_' + widgetGroup.id, widgetGroup.enableWidgets);
    });

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}