import { Injectable } from '@angular/core';
import {ApiService} from '../../../../core/services/api.service';
import {Assets} from '../models/carpark-items.model';

@Injectable()
export class CarparkAssetsService {

  private apiUrl = `/pg/carpark-assets`;

  constructor(
    private apiService: ApiService,
  ) { }

  public getAll(type: string): Promise<Assets[]> {
    const url = `${this.apiUrl}/${type}`;
    return this.apiService.get(url);
  }

  public getAllByProject(projectId: number, type: string): Promise<Assets[]> {
    const url = `${this.apiUrl}/by-project/${type}/${projectId}`;
    return this.apiService.get(url);
  }

  public getByParkZone(parkZoneId: number, type: string): Promise<Assets[]> {
    const url = `${this.apiUrl}/by-carparkZone/${type}/${parkZoneId}`;
    return this.apiService.get(url);
  }

  create(asset): Promise<any> {
    const url = `${this.apiUrl}/install/${asset.codification_id}`;
    return this.apiService.put(url, asset);
  }

  update(asset): Promise<any> {
    const url = `${this.apiUrl}/${asset.codification_id}`;
    return this.apiService.put(url, asset);
  }

  delete(codificationId: string): Promise<any> {
    const url = `${this.apiUrl}/${codificationId}`;
    return this.apiService.delete(url);
  }
}
