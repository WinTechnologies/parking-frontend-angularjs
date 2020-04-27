import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeWp } from './models/employee.model';
import { Workplan } from '../workplans/models/workplan.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()

export class PgEmployeeWpService {
  private apiUrl = `${this.apiEndpoint}/pg/employee-wp`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET employeewps from the server */
  public get(options?: any): Observable<EmployeeWp[]> {
    return  this.http.get<EmployeeWp[]>(this.apiUrl,  {params: options});
  }

  /** GET employeewps from the server */
  public getEmployees(options?: any): Observable<Employee[]> {
    const url = `${this.apiUrl}/employees`;
    return  this.http.get<Employee[]>(url,  {params: options});
  }

    /** GET unassigned employeewps from the server */
    public getUnassingedEmployees(options?: any): Observable<Employee[]> {
      const url = `${this.apiUrl}/unassigned-employees`;
      return  this.http.get<Employee[]>(url,  {params: options});
    }

  /** POST: create a new employee_wp to the server */
  public create(employee_wp: EmployeeWp[]): Observable<EmployeeWp[]> {
    return this.http.post<EmployeeWp[]>(this.apiUrl, employee_wp, httpOptions);
  }

  /** PUT: update the employee_wp on the server */
  public update (employee_wp: EmployeeWp): Observable<any> {
    const id = employee_wp.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<EmployeeWp>(url, employee_wp, httpOptions);
  }

  /** DELETE: delete the employee_wp on the server */
  public delete(workplan: Workplan): Observable<any> {
    const workplan_id = workplan.id;
    const url = `${this.apiUrl}/${workplan_id}`;
    return this.http.delete<EmployeeWp>(url, httpOptions);
  }

  /** DELETE: delete the employee_wp bye employee id on the server */
  public deleteByEmployeeId(employee_id: String): Observable<any> {
    const url = `${this.apiUrl}/employee/${employee_id}`;
    return this.http.delete<EmployeeWp>(url, httpOptions);
  }
}