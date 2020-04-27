import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vat } from '../models/vat';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable()
export class PgVatService {
  private apiUrl = `${this.apiEndpoint}/pg/vat`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
  }
  /** GET projects from the server */
  public get(options?: any): Observable<Vat[]> {
    return  this.http.get<Vat[]>(this.apiUrl,  {params: options});
  }

  /** POST: create a new project to the server */
  public create (project: Vat): Observable<Vat> {
    return this.http.post<Vat>(this.apiUrl, project, httpOptions);
  }

  /** PUT: update the project on the server */
  public update (project: Vat): Observable<any> {
    const id = project.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Vat>(url, project, httpOptions);
  }

  /** DELETE: delete the project on the server */
  public delete (project: Vat): Observable<any> {
    const id = project.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Vat>(url, httpOptions);
  }
}