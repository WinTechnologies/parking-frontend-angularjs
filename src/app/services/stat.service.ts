import { Injectable, Inject } from '@angular/core';
import { Site } from '../shared/classes/site';
import { Observable ,  of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URLSearchParams } from '@angular/http';
import { Chart } from '../shared/classes/chart';
import { User } from '../shared/classes/user';



const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class StatService {

  private statsUrl = `${this.apiEndpoint}/stats`;
  private analyticsUrl = `${this.apiEndpoint}/pg/analytics`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET s from the server */
  getCharts(): Observable<Chart[]> {
    return this.http.get<Chart[]>(this.statsUrl);
  }


  getAllChartSettings(): Observable<any> {
    return this.http.get<any>(this.analyticsUrl + '/settings');
  }

  getChartAnalytic(start_date, end_date, user_id, project_id?): Observable<any> {
    let params = new URLSearchParams();
    params.append('start_date', start_date);
    params.append('end_date', end_date);
    params.append('user_id', user_id);
    if (project_id) { params.append('project_id', project_id); }

    return this.http.get<any>(this.analyticsUrl + '?' + params.toString());
  }

  getSingleChartAnalytic(start_date, end_date, settings, project_id?): Observable<any> {
    let params = new URLSearchParams();
    params.append('start_date', start_date);
    params.append('end_date', end_date);
    params.append('settings', JSON.stringify(settings));
    if (project_id) { params.append('project_id', project_id); }

    return this.http.get<any>(this.analyticsUrl + "?" + params.toString());
  }

  addChartForUser(user_id, settings, start_date, end_date, project_id?): Observable<any> {
    const request = {
      user_id,
      settings: settings,
      start_date,
      end_date,
      project_id
    };
    return this.http.post(this.analyticsUrl, request, httpOptions);

  }


  deleteCharts(user_id, delete_id?): Observable<any> {
    const request = {
      user_id,
      delete_id
    };
    httpOptions['body'] = request;
    return this.http.delete(this.analyticsUrl, httpOptions);

  }

  /** GET s from the server */
  getChartsByUser(data: any): Observable<Chart[]> {
    if (!data.chart_title) data.chart_title = null;
    return this.http.get<Chart[]>(`${this.statsUrl}/user/find/charts/profile?chart_title=${data.chart_title}&username=${data.username}`);
  }

  /** GET s from the server */
  getUserCharts(user: User): Observable<Chart[]> {
    return this.http.get<Chart[]>(`${this.statsUrl}/user/param/${user.usertype}`);
  }

  /** GET s from the server */
  getUserData(user: User, chart: Chart): Observable<Chart[]> {
    let params = new URLSearchParams();
    if (chart && chart.chart_x && chart.chart_y) {
      params.append("chart_x", chart.chart_x);
      params.append("chart_y", chart.chart_y);
      if (chart['multi']) params.append("multi", chart['multi']);
      if (chart.type) params.append("type", chart.type);
      if (chart.periode) {
        params.append("periode", chart.periode);
        if (chart.function)
          params.append("function", chart.function);
      }
      if (user && user.id && user.project_id && user.username && user.site_id) {
        params.append("id", user.id);
        params.append("project_id", user.project_id.toString());
        params.append("site_id", user.site_id);
        params.append("username", user.username);
      }
      return user.usertype === 'Driver' || user.usertype === 'Clamper' ? this.http.get<any>(`${this.statsUrl}/driver/data?${params.toString()}`) : this.http.get<any>(`${this.statsUrl}/enforcer/data?${params.toString()}`);
    }

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(null);
      }, 0);
    });
  }

  /** PUT: update the stat on the server */
  updateChart(chart: Chart): Observable<any> {
    return this.http.put(this.statsUrl, chart, httpOptions);
  }

  /** POST: add a new chart to the server */
  addChart(chart: Chart): Observable<Chart> {
    return this.http.post<Chart>(this.statsUrl, chart, httpOptions);
  }

  /** DELETE: delete a chart from the server */
  deleteChart(chart: Chart | string): Observable<Chart> {
    const id = typeof chart === 'string' ? chart : chart.id;
    const url = `${this.statsUrl}?id=${id}`;

    return this.http.delete<Chart>(url, httpOptions);
  }

  // /** DELETE: delete the chart from the server */
  // deleteSite (chart: Site | string): Observable<Site> {
  //   const id = typeof chart === 'string' ? chart : chart.id;
  //   const url = `${this.statsUrl}?id=${id}`;

  //   return this.http.delete<Site>(url, httpOptions);
  // }

  /** */
  getChartColumns(): Observable<any[]> {
    return this.http.get<any[]>(this.statsUrl + "/axis");
  }

  getChartData(chart: Chart, filters?: object, from?: string, to?: string): Observable<any> {
    let params = new URLSearchParams();
    if (chart && chart.chart_x && chart.chart_y) {
      params.append("chart_x", chart.chart_x);
      params.append("chart_y", chart.chart_y);

      if (chart.periode) {
        params.append("periode", chart.periode);
        if (chart.function)
          params.append("function", chart.function);
      }

      if (filters) {
        for (let key in filters) {
          if (!!filters[key])
            params.append(key, filters[key]);
        }
      }

      if (from) params.append("from", from);
      if (to) params.append("to", to);
      return this.http.get<any>(this.statsUrl + "/data?" + params.toString());
    }

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(null);
      }, 0);
    });

  }

}
