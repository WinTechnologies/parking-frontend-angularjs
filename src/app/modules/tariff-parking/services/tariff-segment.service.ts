import { Injectable } from '@angular/core';
import { TariffSegment } from '../models/tariff-segment.model';
import { ApiService } from '../../../core/services/api.service';

@Injectable()
export class TariffSegmentService {

  private apiUrl = `/pg/tariff-segment`;

  constructor(
    private apiService: ApiService,
  ) { }

  /** GET segments from the server */
  public get(options?: any): Promise<any[]> {
    return  this.apiService.get(this.apiUrl,  options);
  }

  /** GET segments for calendar view */
  public getOverview(options?: any): Promise<any[]> {
    const url = `${this.apiUrl}/overview`;
    return  this.apiService.get(url,  options);
  }

  /** POST: create a new segment to the server */
  public create (segment: TariffSegment): Promise<any> {
    return this.apiService.post(this.apiUrl, segment);
  }

  /** PUT: update the segment on the server */
  public update (segment: TariffSegment): Promise<any> {
    const url = `${this.apiUrl}/${segment.id}`;
    return this.apiService.put(url, segment);
  }

  /** DELETE: delete the segment on the server */
  public delete (segmentId: number): Promise<any> {
    const url = `${this.apiUrl}/${segmentId}`;
    return this.apiService.delete(url);
  }

  public calculatePrice(params): Promise<any> {
    const url = `${this.apiUrl}/calculate-price`;
    return this.apiService.get(url, params);
  }
}
