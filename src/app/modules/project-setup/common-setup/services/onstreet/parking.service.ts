import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import {Parking} from '../../models/onstreet/parking.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgParkingsService {

  private apiUrl = `${this.apiEndpoint}/pg/parkings`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET parkings from the server */
  public get(options?: any): Observable<Parking[]> {
    return  this.http.get<Parking[]>(this.apiUrl,  {params: options});
  }

  public getWithDetails(options?: any): Observable<Parking[]> {
    return  this.http.get<Parking[]>(this.apiUrl + '/details',  {params: options});
  }

  /** GET parkings with zones */
  public getWithZones(options?: any): Observable<Parking[]> {
    return  this.http.get<Parking[]>(this.apiUrl + '/with-zone',  {params: options});
  }

  /** POST: create a new parking to the server */
  public create (parking: Parking): Observable<Parking> {
    return this.http.post<Parking>(this.apiUrl, parking, httpOptions);
  }

  /** PUT: update the parking on the server */
  public update (parking: Parking): Observable<any> {
    const id = parking.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Parking>(url, parking, httpOptions);
  }

  /** DELETE: delete the parking on the server */
  public delete (parking: Parking): Observable<any> {
    const id = parking.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Parking>(url, httpOptions);
  }

  public getNumber(options?: any): Observable<Parking[]> {
    const url = `${this.apiUrl}/number`;
    return  this.http.get<Parking[]>(url,  {params: options});
  }

  public getParkingCode(options?: any): Observable<Parking[]> {
    const url = `${this.apiUrl}/parking-code`;
    return  this.http.get<Parking[]>(url,  {params: options});
  }

  public getPaymentMethod(options?: any): Observable<any[]> {
    const url = `${this.apiUrl}/payment-method`;
    return  this.http.get<any[]>(url,  {params: options});
  }
}
