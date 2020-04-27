import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import date from 'date-and-time';

interface DistrOfWorkTimeByStatus {
  color: string;
  name: string;
  percent: number;
}

interface DistrOfWorkTimeByDistance {
  index: number;
  distance: number;
}

interface CnCntByStatus {
  name: string;
  count: number;
}


interface CnCntByViolation {
  name: string;
  count: number;
}

interface NbrOfViolationsByViolationType {
  hour: number;
  count: number;
}

interface NbrOfViolationsByPlateType {
  hour: number;
  count: number;
}

interface Jobs {
  type: string;
  count: number;
}

interface NbrOfViolationByStreet {
  name: string;
  count: number;
}

interface MinutesForObservation {
  hour: number;
  avg_observation_time: number;
}

export interface ChartStatisticResponse {
  total_time_seconds: number;
  total_distance_km: number;
  medium_speed_km_per_hour: number;
  longest_cn_interval_seconds: number;
  fastest_cn_interval_seconds: number;
  cn_cnt: number;
  cn_cnt_max: number;
  cn_cnt_min: number;
  cn_cnt_avg: number;
  cn_cnt_rank: number;
  cn_cnt_total_rank: number;
  wp_covering_percent: number;
  distr_of_work_time_status: DistrOfWorkTimeByStatus[];
  distr_of_work_time_by_distance: DistrOfWorkTimeByDistance[];
  cn_cnt_by_status: CnCntByStatus[];
  cn_cnt_by_violation: CnCntByViolation[];
  violation_cnt_by_violation_type: { [key: string]: NbrOfViolationsByViolationType[] };
  violation_cnt_by_plate_type: { [key: string]: NbrOfViolationsByPlateType[] };
  job_cnt_by_triggered: Jobs[];
  job_cnt_by_type: Jobs[];
  violation_cnt_by_street: NbrOfViolationByStreet[];
  walking_distance_per_day_km: number;
  minutes_for_observation: MinutesForObservation[];
}

export interface Contravention {
  cn_number_offline: string;
  latitude: number;
  longitude: number;
  creation: string;
}

export interface MapStatisticResponse {
  movement: { [key: string]: number[] };
  contraventions: Contravention[];
}

@Injectable()
export class PerformanceService {
  private performanceUrl = `${this.apiEndpoint}/pg/performance`;
  private dateFormat = 'YYYY-MM-DD';

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
  ) {
  }

  public getChartStatistic(employeeId: string, projectId: number | string, fromDate: Date, toDate: Date): Observable<ChartStatisticResponse> {
    const params = {
      from: date.format(fromDate, this.dateFormat),
      to: date.format(toDate, this.dateFormat),
    };

    if (projectId !== null) {
      params['project_id'] = projectId.toString();
    }

    return this.http.get<ChartStatisticResponse>(`${this.performanceUrl}/${employeeId}`, {
      params,
    });
  }

  public getMapStatistic(employeeId: string, projectId: number | string, fromDate: Date, toDate: Date): Observable<MapStatisticResponse> {
    const params = {
      from: date.format(fromDate, this.dateFormat),
      to: date.format(toDate, this.dateFormat),
    };

    if (projectId !== null) {
      params['project_id'] = projectId.toString();
    }

    return this.http.get<MapStatisticResponse>(`${this.performanceUrl}/${employeeId}/map`, {
      params,
    });
  }
}
