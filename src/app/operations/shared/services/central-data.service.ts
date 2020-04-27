import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { BehaviorSubject } from 'rxjs';
import {
  CNSearchFilter,
  CNSearchValues,
} from '../../../shared/classes/search-filters';
import {config} from '../../../../config';

/**
 * Type Definition of some API Responses
 */
export interface FiltersForTicketsResponse {
  plateCountries: any[];
  plateTypes: any[];
}
export interface FiltersForJobsResponse {
  plateCountries: any[];
  plateTypes: any[];
  statuses: any[];
}
export interface ViolationCodesResponse {
  project_id: number;
  id: number;
  violation_code: string;
  violation_name_en: string;
  violation_name_ar: string;
}

@Injectable()
export class CentralDataService {
  private searchUrl = `search`;

  cnSearchFilter: CNSearchFilter = {
    project_id: '',
    start_date: new Date(),
    end_date: new Date(),
    start_time: '',
    end_time: '',
    cn_number: '',
    cn_number_offline: '',
    plate_country: '',
    plate_type: '',
    plate_num: '',
    plate_lat: '',
    taker_username: '',
    status: '',
  };

  cnSearchValues: CNSearchValues = {
    projects: [],
    issuedCountries: [],
    plateTypes: [],
    statuses: [],
    violations: [],
    challengeStatusList: config.cnChallengeStates,
    reviewStatusList: config.cnReviewStates
  };

  /**
   * Available Project List
   */
  private projects = new BehaviorSubject<any>([]);
  $projects = this.projects.asObservable();

  /**
   * Available Violations List
   */
  private violationCodes = new BehaviorSubject<any>([]);
  $violationCodes = this.violationCodes.asObservable();

  /**
   * Available VehicleType(PlateType) List
   */
  private vehiclePlateTypes = new BehaviorSubject<any>([]);
  $vehiclePlateTypes = this.vehiclePlateTypes.asObservable();

  /**
   * Available IssuedCountry(PlateCountry) List
   */
  private issuedCountries = new BehaviorSubject<any>([]);
  $issuedCountries = this.issuedCountries.asObservable();

  private filtersForTickets = new BehaviorSubject<FiltersForTicketsResponse>({
    plateCountries: [],
    plateTypes: [],
  });
  $filtersForTickets = this.filtersForTickets.asObservable();

  private filtersForJobs = new BehaviorSubject<FiltersForJobsResponse>({
    plateCountries: [],
    plateTypes: [],
    statuses: [],
  });
  $filtersForJobs = this.filtersForJobs.asObservable();

  constructor(
    private readonly apiService: ApiService
  ) {
    this.getProjects();
    this.getViolationCodes();
    //this.getFiltersForJobs();
    //this.getFiltersForCarparks();
    this.getVehiclePlateTypes();
    this.getIssuedCountries();
  }

  private getProjects(): Promise<any>  {
    const data = this.projects.getValue();
    if (!data || data.length === 0) {
      return new Promise((resolve, reject) => {
        this.apiService.get(`/pg/projects`)
          .then(res => this.projects.next(res))
          .catch(err => reject(err));
      });
    } else {
      return new Promise((resolve) =>  resolve(data));
    }
  }

  private getViolationCodes(): Promise<ViolationCodesResponse[]> {
    const data: ViolationCodesResponse[] = this.violationCodes.getValue();
    if (!data || data.length === 0) {
      return new Promise((resolve, reject) => {
        this.apiService.get(`/pg/violation`)
          .then(res => this.violationCodes.next(res))
          .catch(err => reject(err));
      });
    } else {
      return new Promise((resolve) =>  resolve(data));
    }
  }

  // private getTypesForTicket(): Promise<FiltersForTicketsResponse>  {
  //   const data: FiltersForTicketsResponse = this.filtersForTickets.getValue();
  //   if (!data || data.plateCountries.length === 0) {
  //     return new Promise((resolve, reject) => {
  //       this.apiService.get(`${this.searchUrl}/filters/tickets`)
  //         .then(res => this.filtersForTickets.next(res))
  //         .catch(err => reject(err));
  //     });
  //   } else {
  //     return new Promise((resolve) => resolve(data));
  //   }
  // }

  private getFiltersForJobs(): Promise<FiltersForJobsResponse>  {
    const data: FiltersForJobsResponse = this.filtersForJobs.getValue();
    if (!data || data.plateCountries.length === 0) {
      return new Promise((resolve, reject) => {
        this.apiService.get(`/${this.searchUrl}/filters/jobs`)
          .then(res => this.filtersForJobs.next(res))
          .catch(err => reject(err));
      });
    } else {
      return new Promise((resolve) => resolve(data));
    }
  }

  private getVehiclePlateTypes(): Promise<any> {
    const data = this.vehiclePlateTypes.getValue();
    if (!data || data.length === 0) {
      return new Promise((resolve, reject) => {
        this.apiService.get(`/pg/vehicle-plate-type`)
          .then(res => this.vehiclePlateTypes.next(res))
          .catch(err => reject(err));
      });
    } else {
      return new Promise((resolve) =>  resolve(data));
    }
  }

  private getIssuedCountries(): Promise<any> {
    const data = this.issuedCountries.getValue();
    if (!data || data.length === 0) {
      return new Promise((resolve, reject) => {
        this.apiService.get(`/pg/vehicle-plate-type/issued-countries`)
          .then(res => this.issuedCountries.next(res))
          .catch(err => reject(err));
      });
    } else {
      return new Promise((resolve) =>  resolve(data));
    }
  }
}
