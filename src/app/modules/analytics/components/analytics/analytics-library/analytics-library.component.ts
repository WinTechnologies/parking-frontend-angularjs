import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CurrentUserService } from '../../../../../services/current-user.service';
import { ToastrService } from 'ngx-toastr';
import { AnalyticsService } from '../../../services/analytics.service';
import { AnalyticsCreateTabModalComponent } from '../../analytics-create-tab-modal/analytics-create-tab-modal.component';
import { LoaderService } from '../../../../../services/loader.service';

export enum ViewMode {
  ListView,
  DetailView,
}

@Component({
  selector: 'app-analytics-library',
  templateUrl: './analytics-library.component.html',
  styleUrls: ['./analytics-library.component.scss']
})

export class AnalyticsLibraryComponent implements OnInit, OnChanges {
  @Input() projectId;
  @Input() groups;
  @Input() showReport;
  @Input() groupReport;
  @Input() tabIndex;
  @Output() updateFlag = new EventEmitter();

  private index = 0;
  ViewMode = ViewMode;
  status: ViewMode;
  headerName = 'My Library';
  groupLibrary: any = [];
  private reportOriginList: any = [];
  reportList: any = [];
  selectedReport: any = {};
  charts: any = [];
  searchValue = '';

  constructor(
    private dialog: MatDialog,
    private currentUserService: CurrentUserService,
    private toastr: ToastrService,
    private analyticsService: AnalyticsService,
    private loaderService: LoaderService,
  ) { }

  async ngOnInit() {
    this.status = ViewMode.ListView;
    this.setReportList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setReportList();
  }

  setReportList() {
    if (this.tabIndex === 0) {
      this.headerName = 'My Library';
      this.reportList = this.showReport;
    } else {
      this.headerName = 'Public Library';
      this.reportList = this.showReport;
    }
    this.groupLibrary = this.groupReport;
    this.reportOriginList = this.reportList;
  }

  /**
   * @param event
   * event.index - ReportList index
   * event.viewMode - ViewMode
   * @param group
   */
  toggleView(event, group) {
    const { index, viewMode } = event;
    this.status = viewMode;
    this.index = index;
    this.selectedReport = [];
    this.charts = [];
    if (group) {
      this.selectedReport = this.groupLibrary[this.index];
    } else {
      this.selectedReport = this.reportList[this.index];
    }
  }

  filterReport(event) {
    this.searchValue = event;
    this.reportList = this.reportOriginList;
    if (this.reportList) {
      this.reportList = this.reportList.filter(row => {
        let bRet = true;
        if (this.searchValue) {
          bRet = bRet && (row.name.toLowerCase().indexOf(this.searchValue.toLowerCase()) >= 0);
        }
        return bRet;
      });
    }
  }

  async filterChart(event) {
    try {
      this.loaderService.enable();
      this.charts = await this.analyticsService.getChartsById(event.reportId, event.filter);
      this.charts.map((element) => element.isShow = true);
    } finally {
      this.loaderService.disable();
    }
  }

  onCreatDashboard() {
    const dialogRef = this.dialog.open(AnalyticsCreateTabModalComponent, {
      width: '500px',
      data: {projectId: this.projectId, reportList: this.reportOriginList}
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.updateFlag.emit(true);
      }
    });
  }

  async updateAllLibrary(event) {
    if (event) {
      this.updateFlag.emit(true);
    }
  }
}