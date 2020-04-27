import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PgActEnforcementIncentive } from '../models/act-enforcement-incentive.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable()
export class PgActEnforcementIncentiveService {
  private apiUrl = `${this.apiEndpoint}/pg/act-enforcement-incentive`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET All act_enforcement_incentive from the server */
  public getAll(options?: any): Observable<PgActEnforcementIncentive[]> {
    return  this.http.get<PgActEnforcementIncentive[]>(this.apiUrl,  {params: options});
  }

  /**
   * Get act_enforcement_incentive from project from the server
   * @param project_id
   */  public get(project_id: number): Observable<PgActEnforcementIncentive[]> {
    const url = `${this.apiUrl}/${project_id}`;
    return this.http.get<PgActEnforcementIncentive[]>(url, httpOptions);
  }

  /** POST: create a new act_enforcement_incentive to the server */
  public create (pgActEnforcementIncentive: PgActEnforcementIncentive): Observable<PgActEnforcementIncentive> {
    return this.http.post<PgActEnforcementIncentive>(this.apiUrl, pgActEnforcementIncentive, httpOptions).pipe(
      catchError((err) => {
        return observableThrowError(err);
    }));
  }

  /** PUT: update the act_enforcement_incentive on the server */
  public update (pgActEnforcementIncentive: PgActEnforcementIncentive): Observable<any> {
    const id = pgActEnforcementIncentive.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<PgActEnforcementIncentive>(url, pgActEnforcementIncentive, httpOptions);
  }

  /** DELETE: delete the act_enforcement_incentive on the server */
  public delete (pgActEnforcementIncentive: PgActEnforcementIncentive): Observable<any> {
    const id = pgActEnforcementIncentive.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<PgActEnforcementIncentive>(url, httpOptions).pipe(
      catchError((err) => {
        return observableThrowError(err);
      }));
  }
}