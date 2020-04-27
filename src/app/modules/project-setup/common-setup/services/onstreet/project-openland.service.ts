import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { ProjectOpenLand } from '../../models/onstreet/project_openland.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgProjectOpenLandService {

  private apiUrl = `${this.apiEndpoint}/pg/project-openlands`;
  // private apiUrl = `http://127.0.0.1:8003/api/pg/project-openlands`;
  
  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET project zone from the server */
  public get(options?: any): Observable<ProjectOpenLand[]> {
    return  this.http.get<ProjectOpenLand[]>(this.apiUrl,  {params: options});    
  }

  /** GET zone code from the server */
  public getLandCode(options?: any): Observable<string> {
    const url = `${this.apiUrl}/land-code`;
    return this.http.get<string>(url,  {params: options});
  }

  public getWithDetails(options?: any): Observable<ProjectOpenLand[]> {
    return  this.http.get<ProjectOpenLand[]>(this.apiUrl + '/zones',  {params: options});    
  }

  /** POST: create a new zone to the server */
  public create (zone: ProjectOpenLand): Observable<ProjectOpenLand> {
    return this.http.post<ProjectOpenLand>(this.apiUrl, zone, httpOptions);
  }

  /** PUT: update the parking on the server */
  public update (zone: ProjectOpenLand): Observable<any> {
    const id = zone.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ProjectOpenLand>(url, zone, httpOptions);
  }

  /** DELETE: delete the parking on the server */
  public delete (zone: ProjectOpenLand): Observable<any> {
    const id = zone.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ProjectOpenLand>(url, httpOptions);
  }
}
