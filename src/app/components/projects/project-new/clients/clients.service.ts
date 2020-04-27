import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Client } from './client.model';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgClientsService {
  private apiUrl = `${this.apiEndpoint}/pg/clients`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET clients from the server */
  public get(options?: any): Observable<Client[]> {
    return  this.http.get<Client[]>(this.apiUrl,  {params: options});
  }

  /** POST: create a new client to the server */
  public create (client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client, httpOptions);
  }

  /** PUT: update the client on the server */
  public update (client: Client): Observable<any> {
    const id = client.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Client>(url, client, httpOptions);
  }

  /** DELETE: delete the client on the server */
  public delete (client: Client): Observable<any> {
    const id = client.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Client>(url, httpOptions);
  }
}