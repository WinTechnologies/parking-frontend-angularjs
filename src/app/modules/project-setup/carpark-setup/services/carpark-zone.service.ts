import { Injectable } from '@angular/core';
import {ApiService} from '../../../../core/services/api.service';
import {ParkZone} from '../models/carpark-items.model';
import {Observable} from 'rxjs';

@Injectable()
export class CarparkZoneService {

  private apiUrl = `/pg/carpark-zones`;

  constructor(
    private apiService: ApiService,
  ) { }

  public getAllByProject(projectId: number): Promise<ParkZone[]> {
    const url = `${this.apiUrl}/by-project/${projectId}`;
    return this.apiService.get(url);
  }

  public getAllByCarpark(carparkId: number): Promise<ParkZone[]> {
    const url = `${this.apiUrl}/by-carpark/${carparkId}`;
    return this.apiService.get(url);
  }

  public getAllByCarparkLevel(levelId: number): Promise<ParkZone[]> {
    const url = `${this.apiUrl}/by-level/${levelId}`;
    return this.apiService.get(url);
  }

  // /** GET zone code from the server */
  // public getZoneCode(): Promise<string> {
  //   const url = `${this.apiUrl}/zone-code`;
  //   return this.apiService.get(url);
  // }

  create(zone): Promise<any> {
    const url = `${this.apiUrl}`;
    return this.apiService.post(url, zone);
  }

  update(zone): Promise<any> {
    const url = `${this.apiUrl}/${zone.id}`;
    return this.apiService.put(url, zone);
  }

  delete(zoneId: number): Promise<any> {
    const url = `${this.apiUrl}/${zoneId}`;
    return this.apiService.delete(url);
  }
}
