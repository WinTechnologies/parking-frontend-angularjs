import { Injectable, Inject } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class PgProjectDashboardService {
  private apiUrl = `${this.apiEndpoint}/pg/widgets`;

  constructor(private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string) {
  }

  public get(options?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params: options });
  }
}