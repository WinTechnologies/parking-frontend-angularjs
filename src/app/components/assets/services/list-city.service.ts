import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListCity } from '../models/list-city.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

/*TODO: move to services*/
@Injectable({
  providedIn: 'root',
})
export class PgListCityService {
  private apiUrl = `${this.apiEndpoint}/pg/list-city`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET List City from the server */
  public get(options?: any): Observable<ListCity[]> {
    return  this.http.get<ListCity[]>(this.apiUrl,  {params: options});
  }

  /** GET List City with projects from the server */
  public getAllWithProjects(options?: any): Observable<ListCity[]> {
    return  this.http.get<ListCity[]>(`${this.apiUrl}/with-projects`,  {params: options});
  }

  /** POST: create a new List City on the server */
  public create (listCity: ListCity): Observable<ListCity> {
    return this.http.post<ListCity>(this.apiUrl, listCity, httpOptions);
  }

  /** PUT: update the List City on the server */
  public update (listCity: ListCity): Observable<any> {
    const cityCode = listCity.city_code;
    const url = `${this.apiUrl}/${cityCode}`;
    return this.http.put<ListCity>(url, listCity, httpOptions);
  }

  /** DELETE: delete the List City on the server */
  public delete (listCity: ListCity): Observable<any> {
    const cityCode = listCity.city_code;
    const url = `${this.apiUrl}/${cityCode}`;
    return this.http.delete<ListCity>(url, httpOptions);
  }
}