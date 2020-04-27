import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { CarparkType, Parking } from '../models/carpark-items.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class CarparkService {

  private apiUrl = `${this.apiEndpoint}/pg/carparks`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  public getAllByProject(projectId: number): Observable<Parking[]> {
    return  this.http.get<Parking[]>(`${this.apiUrl}/by-project/${projectId}`);
  }

  public getAllByProjectZone(zoneId: number): Observable<Parking[]> {
    return  this.http.get<Parking[]>(`${this.apiUrl}/by-zone/${zoneId}`);
  }

  public getAllByTerminal(terminalId: number): Observable<Parking[]> {
    return  this.http.get<Parking[]>(`${this.apiUrl}/by-terminal/${terminalId}`);
  }

  public getAllCarparkTypes(options?: any): Observable<CarparkType[]> {
    const url = `${this.apiUrl}/carpark-types`;
    return  this.http.get<CarparkType[]>(url,  {params: options});
  }

  public getParkingCode(options?: any): Observable<string> {
    const url = `${this.apiUrl}/parking-code`;
    return  this.http.get<string>(url,  {params: options});
  }

  /** GET: get all carpark
   * @param url
   * @param options
   */
  public getAll(url: string, options?: any): Observable<Parking[]> {
    const additionalUrl = (url) ? url : ''; // map
    return this.http.get<Parking[]>( `${this.apiUrl}/${additionalUrl}`, {params: options});
  }

  /** POST: create a new carpark to the server */
  public create (parking: Parking): Observable<Parking> {
    return this.http.post<Parking>(this.apiUrl, parking, httpOptions);
  }

  /** PUT: update the parking on the server */
  public update (parking: Parking): Observable<any> {
    const id = parking.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Parking>(url, parking, httpOptions);
  }

  // TODO: pending
  /** DELETE: delete the parking on the server */
  public delete (parking: Parking): Observable<any> {
    const id = parking.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Parking>(url, httpOptions);
  }
}
