import { Injectable } from '@angular/core';
import {ApiService} from '../../../../core/services/api.service';
import {ParkSpace, VehicleType} from '../models/carpark-items.model';

@Injectable()
export class ParkSpaceService {

  private apiUrl = `/pg/park-space`;
  private vehicleUrl = `/pg/vehicle`;

  constructor(
    private apiService: ApiService,
  ) { }


  public getAllByProject(projectId: number): Promise<ParkSpace[]> {
    const url = `${this.apiUrl}/by-project/${projectId}`;
    return this.apiService.get(url);
  }

  public getByCarparkZone(zoneId: number): Promise<ParkSpace[]> {
    const url = `${this.apiUrl}/by-carparkZone/${zoneId}`;
    return this.apiService.get(url);
  }

  public getCode(options?: any): Promise<string> {
    const url = `${this.apiUrl}/get-code`;
    return this.apiService.get(url, options);
  }

  create(packspace): Promise<any> {
    const url = `${this.apiUrl}`;
    return this.apiService.post(url, packspace);
  }

  update(packspace): Promise<any> {
    const url = `${this.apiUrl}/${packspace.id}`;
    return this.apiService.put(url, packspace);
  }

  delete(packspaceId: number): Promise<any> {
    const url = `${this.apiUrl}/${packspaceId}`;
    return this.apiService.delete(url);
  }

  public getAllVehicleTypes(): Promise<VehicleType[]> {
    const url = `${this.vehicleUrl}/types`;
    return this.apiService.get(url);
  }
}
