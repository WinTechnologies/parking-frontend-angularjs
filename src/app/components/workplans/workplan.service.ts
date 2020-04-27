import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workplan } from './models/workplan.model';
import { Reoccuring } from './workplan-new/reoccurings/models/reoccurings.model';
import { Exception } from './workplan-new/exceptions/models/exceptions.model';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgWorkplanService {
  private apiUrl = `${this.apiEndpoint}/pg/workplans`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET workplans from the server */
  public get(options?: any): Observable<Workplan[]> {
    return this.http.get<Workplan[]>(this.apiUrl, {params: options});
  }

  /** GET Employee's workplan from the server */
  public getEmployeeWorkplan(employeeId): Observable<Workplan> {
    return this.http.get<Workplan>(`${this.apiUrl}/employee/${employeeId}`);
  }

  /** POST: create a new workplan to the server */
  public create (workplan: Workplan): Observable<Workplan> {
    return this.http.post<Workplan>(this.apiUrl, workplan, httpOptions);
  }

  /** PUT: update new reoccurings with old ones */
  public updateReoccurings(workplan: Workplan, reoccurings: Reoccuring[], deleteReoccuringIds: any[]): Observable<Workplan> {
    return this.http.put<Workplan>(`${this.apiUrl}/reoccurings/${workplan.id}`, {
      id: workplan.id,
      date_start: workplan.date_start,
      date_end: workplan.date_end,
      reoccurings,
      deleteReoccurings: deleteReoccuringIds,
    }, httpOptions);
  }

  /** PUT: update new exceptions with old ones in Workplan */
  public updateExceptions(workplan: Workplan, exceptions: Exception[], deleteExceptionIds: any[]): Observable<Workplan> {
    return this.http.put<Workplan>(`${this.apiUrl}/exceptions/${workplan.id}`, {
      id: workplan.id,
      exceptions,
      deleteExceptions: deleteExceptionIds,
    }, httpOptions);
  }

  /** PUT: Add new exceptions to workplan & Remove exceptions from an employee */
  public updateEmployeeReoccurings(employee_id: string, workplan: Workplan, reoccurings: Reoccuring[]): Observable<Workplan> {
    return this.http.put<Workplan>(`${this.apiUrl}/employee-reoccurings/${employee_id}`, {
      employee_id,
      workplan_id: workplan.id,
      reoccurings,
    }, httpOptions);
  }

  /** PUT: Add new exceptions to workplan & Remove exceptions from an employee */
  public updateEmployeeExceptions(employee_id: string, workplan: Workplan, exceptions: Exception[]): Observable<Workplan> {
    return this.http.put<Workplan>(`${this.apiUrl}/employee-exceptions/${employee_id}`, {
      employee_id,
      workplan_id: workplan.id,
      exceptions,
    }, httpOptions);
  }

  /** DELETE a workpalan **/
  public delete (workplan: Workplan): Observable<any> {
    const wp_name = workplan.wp_name;
    const url = `${this.apiUrl}/${wp_name}`;
    return this.http.delete(url, httpOptions);
  }
}