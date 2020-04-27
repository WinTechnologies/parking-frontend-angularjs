import { Injectable, Inject } from '@angular/core';
import { ListEnforcerStatus } from '../shared/classes/list-enforcer-status';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable,  of } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ListEnforcerStatusService {
  private apiUrl = `${this.apiEndpoint}/pg/list-enforcer-status`;
  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

    /** GET s from the server */
    getListEnforcerStatus(): Observable<ListEnforcerStatus[]> {
        return this.http.get<ListEnforcerStatus[]>(this.apiUrl);
    }
}