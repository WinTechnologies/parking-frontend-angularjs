import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ProjectActivity } from '../models/project-activity.model';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable()
export class PgProjectActivityService {
  private apiUrl = `${this.apiEndpoint}/pg/project-activity`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
  }
  /** GET projects from the server */
  public get(options?: any): Observable<ProjectActivity[]> {
    return  this.http.get<ProjectActivity[]>(this.apiUrl,  {params: options});
  }

  /** POST: create a new project to the server */
  public create (project: ProjectActivity): Observable<ProjectActivity> {
    return this.http.post<ProjectActivity>(this.apiUrl, project, httpOptions);
  }

  /** PUT: update the project on the server */
  public update (project: ProjectActivity): Observable<any> {
    const id = project.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ProjectActivity>(url, project, httpOptions);
  }

  /** DELETE: delete the project on the server */
  public delete (project: ProjectActivity): Observable<any> {
    const id = project.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ProjectActivity>(url, httpOptions);
  }
}