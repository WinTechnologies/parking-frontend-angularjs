import { Injectable, Inject } from '@angular/core';
import { HhdTracking } from '../shared/classes/hhd-tracking';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable,  of } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class HhdTrackingService {
  private apiUrl = `${this.apiEndpoint}/pg/hhd-tracking`;
  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** POST: add a new hhd-tracking to the server */
  addTrackingInfo (hhdTracking: HhdTracking): Observable<HhdTracking> {
    return this.http.post<HhdTracking>(this.apiUrl + "/", hhdTracking, httpOptions);
  }
}