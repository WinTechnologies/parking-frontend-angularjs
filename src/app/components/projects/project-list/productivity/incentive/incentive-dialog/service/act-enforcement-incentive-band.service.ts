
import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PgActEnforcementIncentiveBand } from '../models/act-enforcement-incentive-band.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable()
export class PgActEnforcementIncentiveBandService {
  private apiUrl = `${this.apiEndpoint}/pg/act-enforcement-incentive-band`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET All act_enforcement_incentive_band from the server */
  public getAll(options?: any): Observable<PgActEnforcementIncentiveBand[]> {
    return  this.http.get<PgActEnforcementIncentiveBand[]>(this.apiUrl,  {params: options});
  }

  /**
   * Get act_enforcement_incentive_band from project from the server
   * @param incentive_id
   */  public get(incentive_id: string): Observable<PgActEnforcementIncentiveBand[]> {
    const url = `${this.apiUrl}/${incentive_id}`;
    return this.http.get<PgActEnforcementIncentiveBand[]>(url, httpOptions);
  }

  /** POST: create a new act_enforcement_incentive_band to the server */
  public create (pgActEnforcementIncentiveBand: PgActEnforcementIncentiveBand): Observable<PgActEnforcementIncentiveBand> {
    return this.http.post<PgActEnforcementIncentiveBand>(this.apiUrl, pgActEnforcementIncentiveBand, httpOptions).pipe(
      catchError((err) => {
        return observableThrowError(err);
    }));
  }

  /** PUT: update the act_enforcement_incentive_band on the server */
  public update (pgActEnforcementIncentiveBand: PgActEnforcementIncentiveBand): Observable<any> {
    const id = pgActEnforcementIncentiveBand.band_id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<PgActEnforcementIncentiveBand>(url, pgActEnforcementIncentiveBand, httpOptions);
  }

  /** DELETE: delete the act_enforcement_incentive_band on the server */
  public delete (id: any): Observable<any> {
    // const id = pgActEnforcementIncentiveBand.band_id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<PgActEnforcementIncentiveBand>(url, httpOptions).pipe(
      catchError((err) => {
        return observableThrowError(err);
      }));
  }

  /** DELETE: delete All incentive Bands  */
  public deleteByIncentive (incentive_id: string): Observable<PgActEnforcementIncentiveBand> {
    // const id = pgActEnforcementIncentiveBand.band_id;
    const url = `${this.apiUrl}/incentive/${incentive_id}`;
    return this.http.delete<PgActEnforcementIncentiveBand>(url, httpOptions).pipe(
      catchError((err) => {
        return observableThrowError(err);
      }));
  }
}