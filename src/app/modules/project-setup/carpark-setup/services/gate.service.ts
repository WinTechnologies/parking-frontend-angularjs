import { Injectable } from '@angular/core';
import {ApiService} from '../../../../core/services/api.service';
import {Gate} from '../models/carpark-items.model';

@Injectable()
export class GateService {

  private apiUrl = `/pg/carpark-gates`;

  constructor(
    private apiService: ApiService,
  ) { }

  /** GET carpark zone from the server */
  // public get() {
  //   const url = `${this.apiUrl}`;
  //   return this.apiService.get(url);
  // }

  public getAllByProject(projectId: number): Promise<Gate[]> {
    const url = `${this.apiUrl}/by-project/${projectId}`;
    return this.apiService.get(url);
  }

  public getByCarparkZone(carparkZoneId: number): Promise<Gate[]> {
    const url = `${this.apiUrl}/by-carparkZone/${carparkZoneId}`;
    return this.apiService.get(url);
  }

  create(gate): Promise<any> {
    const url = `${this.apiUrl}`;
    return this.apiService.post(url, gate);
  }

  update(gate): Promise<any> {
    const url = `${this.apiUrl}/${gate.id}`;
    return this.apiService.put(url, gate);
  }

  delete(gateId: number): Promise<any> {
    const url = `${this.apiUrl}/${gateId}`;
    return this.apiService.delete(url);
  }
}
