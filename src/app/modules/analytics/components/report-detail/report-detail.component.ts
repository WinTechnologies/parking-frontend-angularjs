import {Component, Output, OnInit, Input, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {ViewMode} from '../analytics/analytics-library/analytics-library.component';
import {AnalyticsService} from '../../services/analytics.service';
import {ToastrService} from 'ngx-toastr';
import {LoaderService} from '../../../../services/loader.service';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.scss']
})
export class ReportDetailComponent implements OnInit, OnChanges {
  @Input() groups: any[];
  @Input() currentReport: any;
  @Input() charts: any[];
  @Output() viewChanged = new EventEmitter();
  @Output() updateFlag = new EventEmitter();
  delConfirm = false;
  delChartIndex = -1;
  isPublic: boolean;
  sharedGroups: any = [];

  public selectedGroup: number;

  constructor(
    private analyticsService: AnalyticsService,
    private toastrService: ToastrService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.selectedGroup = this.groups && this.groups.length
      ? this.groups[0].id
      : null;
    this.isPublic = !this.currentReport.created_by_me;
    if (this.currentReport.group_library_id) {
      this.sharedGroups = this.groups.filter(
        group => this.currentReport.group_library_id.indexOf(group.id) >= 0
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.selectedGroup = this.groups && this.groups.length
      ? this.groups[0].id
      : null;
    this.isPublic = !this.currentReport.created_by_me;
  }

  showReportList() {
    this.viewChanged.emit({
      index: 0,
      viewMode: ViewMode.ListView,
    });
  }

  toggleChart(data, index) {
    this.charts[index].isShow = !!data.checked;
  }

  deleteChart(index) {
    this.delChartIndex = index;
    this.delConfirm = true;
  }

  async removeChart() {
    try {
      this.loaderService.enable();
      const result = await this.analyticsService.deleteChart(this.charts[this.delChartIndex].settings.id);
      if (result.message === 'success') {
        this.toastrService.success('The chart is deleted successfully.', 'success');
        this.charts.splice(this.delChartIndex, 1);
      } else {
        this.toastrService.error(result.error.message ? result.error.message : 'Something is wrong.', 'error');
      }
      this.delChartIndex = -1;
      this.delConfirm = false;
    } finally {
      this.loaderService.disable();
    }
  }

  cancelDel() {
    this.delChartIndex = -1;
    this.delConfirm = false;
  }

  async shareToLibrary() {
    try {
      const result = await this.analyticsService.shareToLibrary(this.currentReport.id, this.selectedGroup);
      this.updateFlag.emit(true);
      this.toastrService.success(result.message, 'success');
    } catch (e) {
      this.toastrService.error(e.error.message, 'error');
    }
  }

  async shareToAll() {
    try {
      const result = await this.analyticsService.shareToAll(this.currentReport.id);
      this.updateFlag.emit(true);
      this.currentReport.is_public = true;
      this.toastrService.success(result.message, 'success');
    } catch (e) {
      this.toastrService.error(e.message ? e.message : 'Something is wrong', 'error');
    }
  }

  async toPrivate() {
    try {
      const result = await this.analyticsService.toPrivate(this.currentReport.id);
      this.updateFlag.emit(true);
      this.currentReport.is_public = false;
      this.toastrService.success(result.message, 'success');
    } catch (e) {
      this.toastrService.error(e.message ? e.message : 'Something is wrong', 'error');
    }
  }

  async toMyLibrary() {
    try {
      const result = await this.analyticsService.forkReport(this.currentReport.id);
      this.updateFlag.emit(true);
      this.toastrService.success(result.message, 'success');
    } catch (e) {
      this.toastrService.error(e.message ? e.message : 'Something is wrong', 'error');
    }
  }

}
