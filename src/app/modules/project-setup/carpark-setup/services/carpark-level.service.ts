import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import {Parking, ParkLevel} from '../models/carpark-items.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class CarparkLevelService {

  private apiUrl = `${this.apiEndpoint}/pg/carpark-levels`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  public getAllByProject(projectId: number): Observable<ParkLevel[]> {
    return  this.http.get<ParkLevel[]>(`${this.apiUrl}/by-project/${projectId}`);
  }

  // public getAllByProjectZone(zoneId: number): Observable<ParkLevel[]> {
  //   return  this.http.get<ParkLevel[]>(`${this.apiUrl}/by-zone/${zoneId}`);
  // }
  //
  // public getAllByTerminal(terminalId: number): Observable<ParkLevel[]> {
  //   return  this.http.get<ParkLevel[]>(`${this.apiUrl}/by-terminal/${terminalId}`);
  // }

  public getAllByCarpark(carparkId: number): Observable<ParkLevel[]> {
    return  this.http.get<ParkLevel[]>(`${this.apiUrl}/by-carpark/${carparkId}`);
  }

  public getLevelCode(options?: any): Observable<string> {
    const url = `${this.apiUrl}/level-code`;
    return  this.http.get<string>(url,  {params: options});
  }

  // TODO: pending
  /** POST: create a new level to the server */
  public create (level: ParkLevel): Observable<ParkLevel> {
    return this.http.post<ParkLevel>(this.apiUrl, level, httpOptions);
  }

  // TODO: pending
  /** PUT: update the level on the server */
  public update (level: ParkLevel): Observable<any> {
    const id = level.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ParkLevel>(url, level, httpOptions);
  }

  // TODO: pending
  /** DELETE: delete the level on the server */
  public delete (level: ParkLevel): Observable<any> {
    const id = level.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ParkLevel>(url, httpOptions);
  }
}
