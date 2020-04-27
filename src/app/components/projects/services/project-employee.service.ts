import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectEmployee } from '../models/project-employee.model';
import { Employee } from '../../employees/models/employee.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable()
export class PgProjectEmployeeService {
  private apiUrl = `${this.apiEndpoint}/pg/project-employee`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
  }

  /** GET project-employee assignment info */
  public getProjectEmployee(options?: any): Observable<ProjectEmployee[]> {
    return  this.http.get<ProjectEmployee[]>(this.apiUrl,  {params: options});
  }

  /**
   * GET employees & project info for one or all projects
   * @param options <{project_id, ...}>
   */
  public getEmployeesByProject(options?: any): Observable<Employee[]> {
    return  this.http.get<Employee[]>(`${this.apiUrl}/employees`,  { params: options });
  }

  public getAssignedProjects(employeeId: string): Observable<any[]> {
    const url = this.apiUrl.concat(`/projects/${employeeId}`);
    return  this.http.get<any[]>(url);
  }

  // TODO: Move to assignment.service -> assignEmployee(); assignEmployees() already exists
  public create(project: ProjectEmployee): Observable<ProjectEmployee> {
    return this.http.post<ProjectEmployee>(this.apiUrl, project, httpOptions);
  }

  // TODO: Note - Duplicated with assignment.service -> unAssignEmployee()
  public delete(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ProjectEmployee>(url, httpOptions);
  }
}
