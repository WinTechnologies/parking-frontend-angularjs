import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient, HttpBackend  } from '@angular/common/http';
import { Observable} from 'rxjs';
import { Project } from '../models/project.model';
import { Subject } from 'rxjs/Subject';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgProjectsService {
  private apiUrl = `${this.apiEndpoint}/pg/projects`;
  public projectObserable = new Subject<number>();

  constructor(
    private http: HttpClient,
    private handler: HttpBackend,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  emitProjectChanged(val) {
    this.projectObserable.next(val);
  }

  /** GET all assigned projects of connected user */
  public getAllUserProjects(options?: any): Observable<Project[]> {
    return  this.http.get<Project[]>(this.apiUrl,  {params: options});
  }

  /** GET one project by id */
  public getProjectById(project_id: string | number): Observable<Project> {
    const url = `${this.apiUrl}/${project_id}`;
    return  this.http.get<Project>(url);
  }

  /** GET next project_code */
  public getNewProjectCode(): Observable<string> {
    const url = `${this.apiUrl}/new-code`;
    return  this.http.get<string>(url);
  }

  /** GET check if a project_code is already taken [{exists: <boolean>}] */
  public checkCodeExists(options?: any): Observable<any[]> {
    const url = `${this.apiUrl}/check-code`;
    return  this.http.get<any[]>(url, { params: options });
  }

  /** POST: create a new project */
  public create(project: Project): Observable<any> {
    return this.http.post<Project>(this.apiUrl, project, httpOptions);
  }

  /** PUT: update the project on the server */
  public update(project: Project): Observable<any> {
    const id = project.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Project>(url, project, httpOptions);
  }

  /** DELETE: delete the project on the server */
  public delete (project: Project): Observable<any> {
    const id = project.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Project>(url, httpOptions);
  }

  // get location from lat/lng
  public getCountryCodeWithName (lat: any, lng: any): Observable<any> {
    const url = `http://api.geonames.org/countryCodeJSON?lat=${lat}&lng=${lng}&username=develop`;
    const httpClient = new HttpClient(this.handler);
    return  httpClient.get(url);
  }
}
