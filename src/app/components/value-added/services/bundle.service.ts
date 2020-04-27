import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { Bundle } from '../models/bundle.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgBundleService {
  private apiUrl = `${this.apiEndpoint}/pg/tariff-bundle`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET bundles from the server */
  public get(options?: any): Observable<Bundle[]> {
    return  this.http.get<Bundle[]>(this.apiUrl,  {params: options});
  }

  /** POST: create a new bundle to the server */
  public create (bundle: Bundle): Observable<Bundle> {
    return this.http.post<Bundle>(this.apiUrl, bundle, httpOptions);
  }

  /** PUT: update the bundle on the server */
  public update (bundle: Bundle): Observable<any> {
    const id = bundle.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Bundle>(url, bundle, httpOptions);
  }

  /** DELETE: delete the bundle on the server */
  public delete (bundle: Bundle): Observable<any> {
    const id = bundle.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Bundle>(url, httpOptions);
  }
}