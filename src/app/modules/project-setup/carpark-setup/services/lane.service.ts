import { Injectable } from '@angular/core';
import {ApiService} from '../../../../core/services/api.service';
import {Lane} from '../models/carpark-items.model';

@Injectable()
export class LaneService {

  private apiUrl = `/pg/carpark-lanes`;

  constructor(
    private apiService: ApiService,
  ) { }

  /** GET gate from the server */
  // public get() {
  //   const url = `${this.apiUrl}`;
  //   return this.apiService.get(url);
  // }

  public getAllByProject(projectId: number): Promise<Lane[]> {
    const url = `${this.apiUrl}/by-project/${projectId}`;
    return this.apiService.get(url);
  }

  public getByGate(gateId: number): Promise<Lane[]> {
    const url = `${this.apiUrl}/by-gate/${gateId}`;
    return this.apiService.get(url);
  }

  create(lane): Promise<any> {
    const url = `${this.apiUrl}`;
    return this.apiService.post(url, lane);
  }

  update(lane): Promise<any> {
    const url = `${this.apiUrl}/${lane.id}`;
    return this.apiService.put(url, lane);
  }

  delete(laneId: number): Promise<any> {
    const url = `${this.apiUrl}/${laneId}`;
    return this.apiService.delete(url);
  }
}
