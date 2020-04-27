import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { BundleService } from '../models/bundle-service.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgBundleValueAddedService {
  private apiUrl = `${this.apiEndpoint}/pg/tariff-bundle-service`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET services from the server */
  public get(options?: any): Observable<BundleService[]> {
    return  this.http.get<BundleService[]>(this.apiUrl,  {params: options});
  }

  /** POST: create a new value to the server */
  public create (value: BundleService): Observable<BundleService> {
    return this.http.post<BundleService>(this.apiUrl, value, httpOptions);
  }

  /** PUT: update the value on the server */
  public update (value: BundleService): Observable<any> {
    const id = value.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<BundleService>(url, value, httpOptions);
  }

  /** DELETE: delete the value on the server */
  public delete (value: number): Observable<any> {
    const id = value;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<BundleService>(url, httpOptions);
  }

  public deleteByService(options?: any): Observable<BundleService[]> {
    const url = `${this.apiUrl}/delete-by-service`;
    return  this.http.get<BundleService[]>(url,  {params: options});
  }
}