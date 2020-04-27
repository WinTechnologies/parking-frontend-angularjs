import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable()
export class TariffParkingBasicService {

  constructor(
    private apiService: ApiService,
  ) { }

  // TODO: Note - Duplicated with projects.service -> get()
  getProjects() {
    return this.apiService.get('/pg/projects');
  }

  getZones(options) {
    return this.apiService.get('/pg/project-zones', options);
  }

  getParkings(options) {
    return this.apiService.get('/pg/parkings', options);
  }

  getCarParks(options) {
    return this.apiService.get('/pg/carparks', options);
  }

  getCarParkZones(options) {
    return this.apiService.get('/pg/carpark-zones', options);
  }
}
