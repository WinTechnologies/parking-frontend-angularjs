import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Keydate } from './keydates.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgKeydatesService {
  private apiUrl = `${this.apiEndpoint}/pg/keydates`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET keydates from the server */
  public get(options?: any): Observable<Keydate[]> {
    return  this.http.get<Keydate[]>(this.apiUrl,  {params: options});
  }

  /** POST: create a new keydate to the server */
  public create (keydate: Keydate): Observable<Keydate> {
    return this.http.post<Keydate>(this.apiUrl, keydate, httpOptions);
  }

  /** PUT: update the keydate on the server */
  public update (keydate: Keydate): Observable<any> {
    const id = keydate.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Keydate>(url, keydate, httpOptions);
  }

  /** DELETE: delete the keydate on the server */
  public delete (keydate: Keydate): Observable<any> {
    const id = keydate.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Keydate>(url, httpOptions);
  }

  /** GET check keydate duplication on the server */
  public check(task_name?: any):Observable<Keydate[]> {
    const url = `${this.apiUrl}/check`;
    return this.http.get<Keydate[]>(url,  {params: task_name});
  }
}