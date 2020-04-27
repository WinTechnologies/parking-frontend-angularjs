import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Employee } from './models/employee.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgEmployeeService {
  private apiUrl = `${this.apiEndpoint}/pg/employees`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET employees from the server */
  get(options?: any): Observable<Employee[]> {
    return  this.http.get<Employee[]>(this.apiUrl,  {params: options});
  }

  getEmployee(employeeId: string): Observable<any> {
    const url = `${this.apiUrl}/${employeeId}`;
    return this.http.get<any>(url, httpOptions);
  }

  getCount(): Observable<any> {
    const url = `${this.apiUrl}/count`;
    return this.http.get<any>(url, httpOptions);
  }

  public getCredentialEmployees(params: any): Observable<Employee[]> {
    const url = `${this.apiUrl}/credentials`;
    return this.http.get<Employee[]>(url, {params: params});
  }

  getWithProjectName(options?: any): Observable<Employee[]> {
    const url = `${this.apiUrl}/projects`;
    return  this.http.get<any[]>(url, {headers: httpOptions.headers, params: options});
  }

  /** Add employee into database **/
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee, httpOptions);
  }

  /** GET departments or positions from the server */
  getValues(type: string): Observable<any[]> {
    const url = `${this.apiEndpoint}/pg/default-values/${type}`;
    return  this.http.get<any[]>(url, httpOptions);
  }

  /** GET status from the server */
  getStatus(options?: any): Observable<any[]> {
    return  this.http.get<any[]>(`${this.apiUrl}/status`,  {params: options});
  }

  /** PUT: update the Employee on the server */
  updateEmployee (employee: Employee): Observable<Employee> {
    const { id, employee_id, ...restEmployeeBody } =  employee;
    const url = `${this.apiUrl}/${employee_id}`;
    return this.http.put<Employee>(url, restEmployeeBody, httpOptions);
  }

  /** DELETE: delete the Employee from the server */
  deleteEmployee (employee: Employee): Observable<Employee> {
    const id =  employee.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Employee>(url, httpOptions);
  }

  setResetCredentials(employee: Employee): Observable<any> {
    return this.http.put<Employee>(`${this.apiUrl}/modify-credentials`, employee, httpOptions);
  }
}
