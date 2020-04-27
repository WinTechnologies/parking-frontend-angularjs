import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { Escalation } from '../models/escalation.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgEscalationService {
  private apiUrl = `${this.apiEndpoint}/pg/escalations`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET escalation from the server */
  public get(options?: any): Observable<Escalation[]> {
    return  this.http.get<Escalation[]>(this.apiUrl,  {params: options});
  }

  /** POST: create a new escalation to the server */
  public create (escalation: Escalation): Observable<Escalation> {
    return this.http.post<Escalation>(this.apiUrl, escalation, httpOptions);
  }

  /** PUT: update the escalation on the server */
  public update (escalation: Escalation): Observable<any> {
    const id = escalation.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Escalation>(url, escalation, httpOptions);
  }

  /** DELETE: delete the escalation on the server */
  public delete (id): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Escalation>(url, httpOptions);
  }
}