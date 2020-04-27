import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { Exception } from './models/exceptions.model';
import { Workplan } from "../../models/workplan.model";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgExceptionService {
  private apiUrl = `${this.apiEndpoint}/pg/exceptions`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET exceptions from the server */
  public get(options?: any): Observable<Exception[]> {
    return this.http.get<Exception[]>(this.apiUrl, {params: options});
  }

  /** POST: create a new exception to the server */
  public create (exception: Exception): Observable<Exception> {
    return this.http.post<Exception>(this.apiUrl, exception, httpOptions);
  }

  /** PUT: update the exception on the server */
  public update (exception: Exception): Observable<any> {
    const id = exception.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Exception>(url, exception, httpOptions);
  }

  /** DELETE: delete the exception on the server */
  public delete (exception: Exception): Observable<any> {
    const id = exception.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Exception>(url, httpOptions);
  }

  public deleteByWP (workplan: Workplan): Observable<any> {
    const id = workplan.id;
    const url = `${this.apiUrl}/wp/${id}`;
    return this.http.delete<Exception>(url, httpOptions);
  }
}
