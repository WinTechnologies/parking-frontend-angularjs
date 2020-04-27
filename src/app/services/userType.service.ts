
import {map} from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { UserType} from '../shared/classes/userType';
import { Observable} from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';





const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class UserTypeService {

  private userTypeUrl = `${this.apiEndpoint}/usertypes`;
  private clientTypeUrl = `${this.apiEndpoint}/products/client_type`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET UserType list */
  getUserTypes(): Observable<UserType[]> {
    return  this.http.get<string[]>(`${this.userTypeUrl}`).pipe(
      map(response => response.map(item => new UserType(item))));
  }
  /** GET UserType list */
  getClientTypes() {
    return  this.http.get<string[]>(`${this.clientTypeUrl}`).pipe(
      map(response => response.map(item => item)));
  }
}
