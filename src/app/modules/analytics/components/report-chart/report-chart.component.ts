import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {gridsterOptions} from '../../config/gridster-options';
import {ChartDetailsModalComponent} from '../chart-details-modal/chart-details-modal.component';
import {ChartSettingsModalComponent} from '../chart-settings-modal/chart-settings-modal.component';
import {MatDialog} from '@angular/material';
import {ToastrService} from 'ngx-toastr';
import {AnalyticsService} from '../../services/analytics.service';

@Component({
  selector: 'app-report-chart',
  templateUrl: './report-chart.component.html',
  styleUrls: ['./report-chart.component.scss']
})
export class ReportChartComponent implements OnInit {
  @Input() currentReport: any;
  @Input() charts: any[];
  @Output() filterParameter = new EventEmitter();
  gridsterOptions = gridsterOptions;
  searchFrom = new Date();
  searchTo = new Date();
  filters: any;
  isPublic: boolean;

  constructor(
    private toastrService: ToastrService,
    private analyticsService: AnalyticsService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.searchFrom.setMonth(this.searchFrom.getMonth() - 1);
    this.onSearch();
    this.isPublic = !this.currentReport.created_by_me;
  }
  onSearch() {
    const filters: any = {
      from: this.searchFrom.toISOString().substring(0, 10),
      to: this.searchTo.toISOString().substring(0, 10)
    };
    this.filters = {...filters};
    this.filterParameter.emit({
      filter: this.filters,
      reportId: this.currentReport.id,
    });
  }

  /**
   Chart settings panel
   */
  onCollapseChart(widget) {
    widget['isShow'] = !widget['isShow'];
  }

  onShowChartDetails(widget) {
    this.dialog.open(ChartDetailsModalComponent, {
      width: '700px',
      data: { ...widget }
    });
  }

  onShowChartSettings(widget?: any) {
    const dialogRef = this.dialog.open(ChartSettingsModalComponent, {
      width: '500px',
      data: {
        chart: widget ? widget.settings : null,
        dashboard_id: this.currentReport.id
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onSearch();
      }
    });
  }

  onReloadChart(widget) {
    widget['isShow'] = false;
    setTimeout(() => widget['isShow'] = true);
  }
}
