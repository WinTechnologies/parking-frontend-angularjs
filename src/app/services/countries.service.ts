
import {map} from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { UserType} from '../shared/classes/userType';
import { Observable} from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';






const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class CountriesService {

  private userTypeUrl = `${this.apiEndpoint}/countries`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  searchCurrency(keyword: string = ''): Observable<Object[]> {
    return  this.http.get<any[]>(`${this.userTypeUrl}/currencies`, {params: {q: keyword}}).pipe(
      map(response => response.map(item => new Object(item))));
  }
}
