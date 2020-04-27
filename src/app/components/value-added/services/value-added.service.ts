import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { ValueAdded } from '../models/value-added.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgValueAddedService {
  private apiUrl = `${this.apiEndpoint}/pg/tariff-service`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET values from the server */
  public get(options?: any): Observable<ValueAdded[]> {
    return  this.http.get<ValueAdded[]>(this.apiUrl,  {params: options});
  }

  /** POST: create a new value to the server */
  public create (value: ValueAdded): Observable<ValueAdded> {
    return this.http.post<ValueAdded>(this.apiUrl, value, httpOptions);
  }

  /** PUT: update the value on the server */
  public update (value: ValueAdded): Observable<any> {
    const id = value.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ValueAdded>(url, value, httpOptions);
  }

  /** DELETE: delete the value on the server */
  public delete (value: ValueAdded): Observable<any> {
    const id = value.id;
    const url = `${this.apiUrl}/${id}`;

    return this.http.delete<ValueAdded>(url, httpOptions);
  }
}