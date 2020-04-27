import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Asset, AssetType } from '../models/asset.model';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgAssetService {
  private apiUrl = `${this.apiEndpoint}/pg/assets`;
  private apiVehicleUrl = `${this.apiEndpoint}/pg/vehicle`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET assets from the server */
  get(params?: any): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl, { params: params });
  }

  getByZones(params?: any): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl + `/zones`, { params: params });
  }
  /** PUT: update the asset on the server */
  update(asset: Asset): Observable<any> {
    const id = asset.codification_id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, asset, httpOptions);
  }

  /** POST: add a new asset to the server */
  add(asset: Asset): Observable<Asset> {
    return this.http.post<Asset>(this.apiUrl, asset, httpOptions);
  }

  /** POST: add a new asset type to the server */
  addType(type: AssetType): Observable<Asset> {
    return this.http.post<any>(this.apiUrl, type, httpOptions);
  }

  /** DELETE: delete the asset from the server */
  delete(asset: Asset | string): Observable<Asset> {
    const id = typeof asset === 'string' ? asset : asset.codification_id;
    const url = `${this.apiUrl}/${id}`;

    return this.http.delete<Asset>(url, httpOptions);
  }

  getStats(params: any = ''): Observable<any[]> {
    const url = `${this.apiUrl}/stats`;
    return this.http.get<any[]>(url, { params: params });
  }

  getModels(params: any = ''): Observable<Asset[]> {
    const url = `${this.apiUrl}/models`;
    return this.http.get<Asset[]>(url, { params: params });
  }

  /** Retrieve the codification_id of assets with status 'Available' */
  getAvailable(params: any = ''): Observable<Asset[]> {
    const url = `${this.apiUrl}/available`;
    return this.http.get<Asset[]>(url, { params: params });
  }

  getDevices(options?: any): Observable<Asset[]> {
    const url = `${this.apiUrl}/devices`;
    return this.http.get<Asset[]>(url, { params: options });
  }

  getCountries(options?: any): Observable<any[]> {
    const url = `${this.apiVehicleUrl}/plate-types`;
    return this.http.get<any[]>(url, { params: options });
  }

  getBrands(options?: any): Observable<any[]> {
    const url = `${this.apiVehicleUrl}/makes`;
    return this.http.get<any[]>(url, { params: options });
  }
}