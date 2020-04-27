import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { LoaderService } from '../../../../services/loader.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})

export class AnalyticsComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('tabGroup') tabGroup;
  @Input() projectId;
  groups: any = [];
  employees: any = [];
  allLibrary: any = [];
  showReport: any = [];
  myReport: any = [];
  publicReport: any = [];
  groupReport: any = [];
  tabIndex = 0;

  constructor(
    private analyticsService: AnalyticsService,
    private loaderService: LoaderService,
  ) { }

  ngAfterViewInit() {
    this.tabIndex = this.tabGroup.selectedIndex;
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.tabIndex = tabChangeEvent.index;
    this.setReportList();
  }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      if (this.projectId) {
        [this.groups, this.employees, this.allLibrary, this.groupReport] = await Promise.all([
          this.analyticsService.getGroups(),
          this.analyticsService.getAllEmployees(),
          this.analyticsService.getAllLibraryByProject(this.projectId),
          this.analyticsService.getGroupLibrary(this.projectId)]
        );
      } else {
        [this.groups, this.employees, this.allLibrary, this.groupReport] = await Promise.all([
          this.analyticsService.getGroups(),
          this.analyticsService.getAllEmployees(),
          this.analyticsService.getAllLibrary(),
          this.analyticsService.getGroupLibrary(0)]
        );
      }
      this.filterReportList();
      this.employees = this.employees.map(employee => {
        if (!employee.picture) {
          employee.picture = '/assets/library_icons/Human_icon_photo_placeholder.svg';
        }
        return employee;
      });
    } finally {
      this.loaderService.disable();
    }
  }

  filterReportList() {
    this.myReport = this.allLibrary.filter(field => field.created_by_me);
    this.publicReport = this.allLibrary.filter(field => field.is_public);
    this.groupReport = this.groupReport.filter(field => (!field.created_by_me));
    this.setReportList();
  }

  setReportList() {
    if (this.tabIndex === 0) {
      this.showReport = this.myReport;
    } else {
      this.showReport = this.publicReport;
    }
  }

  ngOnDestroy(): void { }

  async updateGroups(event) {
    if (event) {
      try {
        this.loaderService.enable();
        this.groups = await this.analyticsService.getGroups();
      } finally {
        this.loaderService.disable();
      }
    }
    return;
  }

  async updateAllLibrary(event) {
    if (event) {
      try {
        this.loaderService.enable();
        if (this.projectId) {
          [this.allLibrary, this.groupReport] = await Promise.all([
            this.analyticsService.getAllLibraryByProject(this.projectId),
            this.analyticsService.getGroupLibrary(this.projectId)]
          );
        } else {
          [this.allLibrary, this.groupReport] = await Promise.all([
            this.analyticsService.getAllLibrary(),
            this.analyticsService.getGroupLibrary(0)]
          );
        }
        this.filterReportList();
      } finally {
        this.loaderService.disable();
      }
    }
  }
}