import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectRoute } from '../models/project-route.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable()
export class PgProjectRouteService {
  private apiUrl = `${this.apiEndpoint}/pg/project-routes`;
  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
  }

  /** GET routes from the server */
  public get(options?: any): Observable<ProjectRoute[]> {
    return  this.http.get<ProjectRoute[]>(this.apiUrl,  {params: options});
  }

  /** GET routes from the server */
  public getOne(id: number): Observable<ProjectRoute> {
    const url = `${this.apiUrl}/${id}`;
    return  this.http.get<ProjectRoute>(url);
  }

  /** POST: create a new route to the server */
  public create (route: ProjectRoute): Observable<ProjectRoute> {
    return this.http.post<ProjectRoute>(this.apiUrl, route, httpOptions);
  }

  /** PUT: update the route on the server */
  public update (route: ProjectRoute): Observable<any> {
    const id = route.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ProjectRoute>(url, route, httpOptions);
  }

  /** DELETE: route the device on the server */
  public delete (id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url, httpOptions);
  }
}