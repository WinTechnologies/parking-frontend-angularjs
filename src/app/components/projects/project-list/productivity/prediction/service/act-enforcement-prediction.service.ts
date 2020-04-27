import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PgActEnforcementPrediction } from '../model/act-enforcement-prediction';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable()
export class PgActEnforcementPredictionService {
  private apiUrl = `${this.apiEndpoint}/pg/act-enforcement-prediction`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET All act_enforcement_prediction from the server */
  public getAll(options?: any): Observable<PgActEnforcementPrediction[]> {
    return  this.http.get<PgActEnforcementPrediction[]>(this.apiUrl,  {params: options});
  }

  /**
   * Get act_enforcement_prediction from project from the server
   * @param project_id
   */
  public get(project_id: number): Observable<PgActEnforcementPrediction[]> {
    const url = `${this.apiUrl}/${project_id}`;
    return this.http.get<PgActEnforcementPrediction[]>(url, httpOptions);
  }

  /** POST: create a new act_enforcement_prediction on the server
   * @param pgActEnforcementPrediction
   */
  public create (pgActEnforcementPrediction: PgActEnforcementPrediction): Observable<PgActEnforcementPrediction> {
    return this.http.post<PgActEnforcementPrediction>(this.apiUrl, pgActEnforcementPrediction, httpOptions).pipe(
      catchError((err) => {
        return observableThrowError(err);
      }));
  }

  /** PUT: update the act_enforcement_prediction on the server
   * @param id
   * @param values fields to update
   */
  public update (id: string, values: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<PgActEnforcementPrediction>(url, values, httpOptions);
  }

  /** DELETE: delete the act_enforcement_prediction on the server
   * @param pgActEnforcementPrediction
   */
  public delete (pgActEnforcementPrediction: PgActEnforcementPrediction): Observable<any> {
    const id = pgActEnforcementPrediction.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<PgActEnforcementPrediction>(url, httpOptions).pipe(
      catchError((err) => {
        return observableThrowError(err);
      }));
  }
}