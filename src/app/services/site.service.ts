
import {map} from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { Site} from '../shared/classes/site';
import { Observable,  of } from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {Address} from '../shared/classes/address';



const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class SiteService {

  private sitesUrl = `${this.apiEndpoint}/sites`;

  /** GET sites from the server */
  getSites(projectId: number = null): Observable<Site[]> {
    const options: any = {};
    if (projectId) {
      options.project_id = projectId;
    }
    return  this.http.get<Site[]>(this.sitesUrl, {params: options}).pipe(
      map(response => response.map(site => {
        site.address = site.address || new Address();
        return new Site(site)
        }
    )));
  }

  /** GET: get site by id from server */
  public getSiteById(siteId: string): Observable<Site> {
    const url = `${this.sitesUrl}/${siteId}`;
    return  this.http.get<Site>(url, httpOptions);
  }

  /** PUT: update the site on the server */
  updateSite (site: Site): Observable<any> {
    return this.http.put(this.sitesUrl, site, httpOptions);
  }

  /** POST: add a new site to the server */
  addSite (site: Site): Observable<Site> {
    return this.http.post<Site>(this.sitesUrl, site, httpOptions);
  }

  /** DELETE: delete the site from the server */
  deleteSite (site: Site | string): Observable<Site> {
    const id = typeof site === 'string' ? site : site.id;
    const url = `${this.sitesUrl}?id=${id}`;

    return this.http.delete<Site>(url, httpOptions);
  }

  /** GET site types from the server */
  getSiteTypes(): Observable<any[]> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next([{id: 0, name: 'OFF STREET'}, {id:1, name: 'ON STREET'}]);
      }, 1);
    });
  }

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

}
