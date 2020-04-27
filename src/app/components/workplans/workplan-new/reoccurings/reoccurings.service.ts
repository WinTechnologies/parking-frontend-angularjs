import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { Reoccuring } from './models/reoccurings.model';
import { Workplan } from '../../models/workplan.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgReoccuringService {
  private apiUrl = `${this.apiEndpoint}/pg/reoccurings`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET employees from the server */
  public get(options?: any): Observable<Reoccuring[]> {
    return this.http.get<Reoccuring[]>(this.apiUrl, {params: options});
  }

  /** POST: create a new reoccur to the server */
  public create (reoccur: Reoccuring): Observable<Reoccuring> {
    return this.http.post<Reoccuring>(this.apiUrl, reoccur, httpOptions);
  }

  /** PUT: update the reoccur on the server */
  public update (reoccur: Reoccuring): Observable<any> {
    const id = reoccur.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Reoccuring>(url, reoccur, httpOptions);
  }

  /** DELETE: delete the reoccur on the server */
  public delete (reoccur: Reoccuring): Observable<any> {
    const id = reoccur.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Reoccuring>(url, httpOptions);
  }

  public deleteByWP (workplan: Workplan): Observable<any> {
    const id = workplan.id;
    const url = `${this.apiUrl}/wp/${id}`;
    return this.http.delete<Reoccuring>(url, httpOptions);
  }
}