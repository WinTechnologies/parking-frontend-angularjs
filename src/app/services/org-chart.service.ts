import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';

import { OrgChartItem } from '../shared/classes/org-chart-item.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgOrgChartService {

  private apiUrl = `${this.apiEndpoint}/pg/org-chart`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET org-chart hierarchy from the server */
  public get(options?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, {params: options});
  }

  /** POST add employee to the project on the server */
  public add(request: any): Observable<any> {
    httpOptions['body'] = request;
    return this.http.post(this.apiUrl, request, httpOptions);
  }

  /** POST update employee to the project on the server */
  public update(request: any): Observable<any> {
    httpOptions['body'] = request;
    return this.http.put(this.apiUrl, request, httpOptions);
  }

  /** DELETE: remove employee from the project on the server */
  public delete(request: any): Observable<any> {
    httpOptions['body'] = request;
    return this.http.delete(this.apiUrl, httpOptions);
  }
}
