import { Injectable } from '@angular/core';
import { TariffInterval } from '../models/tariff-interval.model';
import { ApiService } from '../../../core/services/api.service';


@Injectable()
export class TariffIntervalService {

  private apiUrl = `/pg/tariff-interval`;

  constructor(
    private apiService: ApiService,
  ) { }

  /** GET intervals from the server */
  public get(options?: any): Promise<TariffInterval[]> {
    return  this.apiService.get(this.apiUrl,  options);
  }

  /** POST: create a new interval to the server */
  public create (interval: TariffInterval): Promise<TariffInterval> {
    return this.apiService.post(this.apiUrl, interval);
  }

  /** PUT: update the interval on the server */
  public update (interval: TariffInterval): Promise<any> {
    const url = `${this.apiUrl}/${interval.id}`;
    return this.apiService.put(url, interval);
  }

  /** DELETE: delete the interval on the server */
  public delete (id: any): Promise<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.apiService.delete(url);
  }
}
