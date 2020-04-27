import { Injectable, Inject } from '@angular/core';
import { Observable,  of } from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root',
})
export class HeatmapService {

  private heatmapUrl = `${this.apiEndpoint}/heatmap`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET coord from the server */
  get(date, time = null, schema, database): Observable<any[]> {
    return of([]);
  }

  /** GET coord from the server */
  getAllByProjectIds(projectIds = [], date): Observable<any[]> {
    return this.http.get<any[]>(this.heatmapUrl, {params: { projectIds, date }});
  }

  /** GET coord from the server */
  getPredictive(date, time = null, schema, database): Observable<any[]> {
    return of([]);
  }

  /** GET coord from the server */
  getUniqueDates(date, time = null, schema, database): Observable<boolean> {
    return of(true);
  }

  /** GET coord from the server */
  getPredictiveDates(date, time = null, schema, database): Observable<boolean> {
    return of(true);
  }
}
