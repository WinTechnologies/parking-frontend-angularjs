import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { ProjectZone } from '../../models/onstreet/project_zone.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgProjectZoneService {

  private apiUrl = `${this.apiEndpoint}/pg/project-zones`;
  // private apiUrl = `http://127.0.0.1:8003/api/pg/project-zones`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET project zone from the server */
  public get(options?: any): Observable<ProjectZone[]> {
    return  this.http.get<ProjectZone[]>(this.apiUrl,  {params: options});
  }

  public getWithProject(options?: any): Observable<ProjectZone[]> {
    return  this.http.get<ProjectZone[]>(this.apiUrl + `/project`,  {params: options});
  }

    /** GET zone code from the server */
    public getZoneCode(options?: any): Observable<string> {
      const url = `${this.apiUrl}/zone-code`;
      return this.http.get<string>(url,  {params: options});
    }

  /** POST: create a new zone to the server */
  public create (zone: ProjectZone): Observable<ProjectZone> {
    return this.http.post<ProjectZone>(this.apiUrl, zone, httpOptions);
  }

  /** PUT: update the parking on the server */
  public update (zone: ProjectZone): Observable<any> {
    const id = zone.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ProjectZone>(url, zone, httpOptions);
  }

  /** DELETE: delete the parking on the server */
  public delete (zone: ProjectZone): Observable<any> {
    const id = zone.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ProjectZone>(url, httpOptions);
  }
}
