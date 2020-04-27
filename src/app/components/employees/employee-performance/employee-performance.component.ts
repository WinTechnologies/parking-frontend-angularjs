import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ChartStatisticResponse, Contravention,
  MapStatisticResponse,
  PerformanceService
} from '../../../services/performance.service';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { Subject } from 'rxjs';
import date from 'date-and-time';
import { Employee } from '../models/employee.model';
import { Project } from '../../projects/models/project.model';
import { PgProjectsService } from '../../projects/services/projects.service';

@Component({
  selector: 'app-employee-performance',
  templateUrl: './employee-performance.component.html',
  styleUrls: ['./employee-performance.component.scss']
})

export class EmployeePerformanceComponent implements OnInit, OnDestroy {
  @Input() employee: Employee;
  @Input() employee_projects: Project[];

  public changeCoordinates = new Subject<number[]>();

  public _currentEmployeeProject: Project = null;

  public set currentEmployeeProject(value: Project) {
    this._currentEmployeeProject = value;

    if (value === null) {
      return;
    }

    const untilGetProjectCoordinates = new Subject<boolean>();
    this.projectsService.getProjectById(value.project_id)
      .takeUntil(untilGetProjectCoordinates)
      .subscribe(project => {
        this.changeCoordinates.next([
          project.center_longitude,
          project.center_latitude,
        ]);

        untilGetProjectCoordinates.next(true);
        untilGetProjectCoordinates.complete();
      });
  }

  public get currentEmployeeProject() {
    return this._currentEmployeeProject;
  }

  public distrOfWorkTimeStatusLabels: Label[] = [];
  public distrOfWorkTimeStatusData: number[] = [];

  public cnIssues: ChartDataSets[] = [];

  public distrOfWorkTimeByDistanceData: ChartDataSets[] = [];

  public cnCntByStatusLabels: Label[] = [];
  public cnCntByStatusData: number[] = [];

  public cnCntByViolationLabels: Label[] = [];
  public cnCntByViolationData: number[] = [];

  public violationCntByViolationTypeLabels: Label[] = [];
  public violationCntByViolationTypeData: ChartDataSets[] = [];

  public violationCntByPlateTypeLabels: Label[] = [];
  public violationCntByPlateTypeData: ChartDataSets[] = [];

  public jobCntByTriggered: ChartDataSets[] = [];
  public jobCntByType: ChartDataSets[] = [];

  public violationCntByStreet: ChartDataSets[] = [];

  public totalKm: number = null;
  public totalSeconds: number = null;
  public mediumSpeedKmPerHour: number = null;
  public fastestCnIntervalSeconds: number = null;
  public longestCnIntervalSeconds: number = null;

  public cnCnt: number = null;
  public cnCntMax: number = null;
  public cnCntMin: number = null;
  public cnCntAvg: number = null;
  public cnCntRank: number = null;
  public cnCntTotalRank: number = null;
  public wpCoveringPercent: number = null;
  public walkingDistancePerDayKm: number = null;

  public minutesForObservationData: ChartDataSets[] = [];

  public mapMovement: { [key: string]: number[] };
  public mapContraventions: Contravention[];

  public dateToggle = 'day';
  public useDatePickers = false;
  private fromDate: Date = null;
  private toDate: Date = null;

  chooseMap = 'status';

  constructor(
    private readonly productivityService: PerformanceService,
    private readonly projectsService: PgProjectsService,
  ) {
  }

  ngOnInit(): void {
    this.fromDate = new Date();
    this.toDate = date.addDays(new Date(), 1);

    this.updateData();
  }

  private prepareDateFilter(): [Date, Date] {
    let fromDate = this.fromDate;
    let toDate = this.toDate;

    if (!this.useDatePickers) {
      switch (this.dateToggle) {
        case 'month':
          const now = new Date();
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          toDate = date.addMonths(fromDate, 1);
          break;
        case 'week':
          fromDate = new Date();
          const day = fromDate.getDay() || 7;
          if ( day !== 1 ) {
            fromDate.setHours(-24 * (day - 1));
          }
          toDate = date.addDays(fromDate, 7);
          break;
        default:
          fromDate = new Date();
          toDate = date.addDays(fromDate, 1);
          break;
      }
    }

    return [fromDate, toDate];
  }

  public updateData() {
    const [fromDate, toDate] = this.prepareDateFilter();

    const projectId = this.currentEmployeeProject ? this.currentEmployeeProject.project_id : null;

    const untilGetChartStatistic = new Subject<boolean>();
    this.productivityService.getChartStatistic(
      this.employee.employee_id, projectId, fromDate, toDate
    )
      .takeUntil(untilGetChartStatistic)
      .subscribe(data => {
        this.extractChartStatistic(data);
        untilGetChartStatistic.next(true);
        untilGetChartStatistic.complete();
      });

    const untilGetMapStatistic = new Subject<boolean>();
    this.productivityService.getMapStatistic(
      this.employee.employee_id, projectId, fromDate, toDate
    )
      .takeUntil(untilGetMapStatistic)
      .subscribe(data => {
        this.extractMapStatistic(data);
        untilGetMapStatistic.next(true);
        untilGetMapStatistic.complete();
      });
  }

  private extractChartStatistic(data: ChartStatisticResponse) {
    this.totalSeconds = data.total_time_seconds;
    this.totalKm = data.total_distance_km;
    this.mediumSpeedKmPerHour = data.medium_speed_km_per_hour;
    this.longestCnIntervalSeconds = data.longest_cn_interval_seconds;
    this.fastestCnIntervalSeconds = data.fastest_cn_interval_seconds;
    this.cnCnt = data.cn_cnt;
    this.cnCntMax = data.cn_cnt_max;
    this.cnCntMin = data.cn_cnt_min;
    this.cnCntAvg = data.cn_cnt_avg;
    this.cnCntRank = data.cn_cnt_rank;
    this.cnCntTotalRank = data.cn_cnt_total_rank;
    this.wpCoveringPercent = data.wp_covering_percent;

    /* ---- */

    this.distrOfWorkTimeStatusLabels = [];
    this.distrOfWorkTimeStatusData = [];
    for (const item of data.distr_of_work_time_status) {
      this.distrOfWorkTimeStatusLabels.push(item.name);
      this.distrOfWorkTimeStatusData.push(item.percent);
    }

    /* ---- */

    this.distrOfWorkTimeByDistanceData = [];
    this.distrOfWorkTimeByDistanceData.push({
      data: data.distr_of_work_time_by_distance.map(item => ({
        x: item.distance,
        y: item.index,
      }))
    });

    /* ---- */

    this.cnCntByStatusLabels = [];
    this.cnCntByStatusData = [];
    this.cnIssues = [];
    for (const item of data.cn_cnt_by_status) {
      this.cnCntByStatusLabels.push(item.name);
      this.cnCntByStatusData.push(item.count);

      this.cnIssues.push({
        data: [
          item.count,
        ],
        label: item.name,
      });
    }

    /* ---- */

    this.cnCntByViolationLabels = [];
    this.cnCntByViolationData = [];
    for (const item of data.cn_cnt_by_violation) {
      this.cnCntByViolationLabels.push(item.name);
      this.cnCntByViolationData.push(item.count);
    }

    /* ---- */

    this.violationCntByViolationTypeLabels = [];
    this.violationCntByViolationTypeData = [];
    for (const [key, items] of Object.entries(data.violation_cnt_by_violation_type)) {
      this.violationCntByViolationTypeLabels.push(key);
      this.violationCntByViolationTypeData.push({
        label: key,
        data: items.map(item => ({
          x: item.hour,
          y: item.count,
        })),
      });
    }

    /* ---- */

    this.violationCntByPlateTypeLabels = [];
    this.violationCntByPlateTypeData = [];
    for (const [key, items] of Object.entries(data.violation_cnt_by_plate_type)) {
      this.violationCntByPlateTypeLabels.push(key);
      this.violationCntByPlateTypeData.push({
        label: key,
        data: items.map(item => ({
          x: item.hour,
          y: item.count,
        })),
      });
    }

    /* ---- */

    this.jobCntByTriggered = [];
    for (const item of data.job_cnt_by_triggered) {
      this.jobCntByTriggered.push({
        data: [
          item.count,
        ],
        label: item.type,
      });
    }

    /* ---- */

    this.jobCntByType = [];
    for (const item of data.job_cnt_by_type) {
      this.jobCntByType.push({
        data: [
          item.count,
        ],
        label: item.type,
      });
    }

    /* ---- */

    this.violationCntByStreet = [];
    for (const item of data.violation_cnt_by_street) {
      this.violationCntByStreet.push({
        data: [
          item.count,
        ],
        label: item.name,
      });
    }

    /* ---- */

    this.walkingDistancePerDayKm = data.walking_distance_per_day_km;

    /* ---- */

    this.minutesForObservationData = [];
    this.minutesForObservationData.push({
      data: data.minutes_for_observation.map(item => ({
        x: item.hour,
        y: item.avg_observation_time,
      }))
    });
  }

  private extractMapStatistic(data: MapStatisticResponse) {
    this.mapMovement = data.movement;
    this.mapContraventions = data.contraventions;
  }

  public setFromDate(value) {
    this.fromDate = value;
  }

  public setToDate(value) {
    this.toDate = value;
  }

  public getIntervalFromSeconds(seconds?: number, useDays = true) {
    if (!seconds) {
      return null;
    }

    const result = [];

    if (useDays) {
      const days = Math.floor(seconds / 86400);
      if (days > 0) {
        seconds -= days * 86400;
        result.push(`${days}d`);
      }
    }

    const hours = Math.floor(seconds / 3600);
    if (hours > 0) {
      seconds -= hours * 3600;
      result.push(`${hours}h`);
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      seconds -= minutes * 60;
      result.push(`${minutes}m`);
    }

    seconds = Math.floor(seconds);
    if (seconds > 0) {
      result.push(`${seconds}s`);
    }

    return result.join(' ');
  }

  ngOnDestroy(): void {
  }
}
