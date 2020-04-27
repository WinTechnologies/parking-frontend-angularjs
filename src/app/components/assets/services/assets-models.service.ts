import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AssetModel } from '../models/asset.model';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgAssetModelsService {
  private apiUrl = `${this.apiEndpoint}/pg/assets-models`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET assets from the server */
  get(params: any = ''): Observable<AssetModel[]> {
    return  this.http.get<AssetModel[]>(this.apiUrl,  {params: params});
  }

  /** GET assets from the server */
  getWithCounts(params: any = ''): Observable<AssetModel[]> {
    return  this.http.get<AssetModel[]>(`${this.apiUrl}/withCounts`,  {params: params});
  }

  getCategoryAsset(): Observable<String[]> {
    const url = `${this.apiUrl}/category-asset`;
    return this.http.get<String[]>(url);
  }

  /** PUT: update the asset on the server */
  update(assetModel: AssetModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${assetModel.id}`, assetModel, httpOptions);
  }

  /** POST: add a new asset to the server */
  create (asset: AssetModel): Observable<AssetModel> {
    return this.http.post<AssetModel>(this.apiUrl, asset, httpOptions);
  }

  /** DELETE: delete the asset from the server */
  delete (asset: AssetModel | string): Observable<AssetModel> {
    const id = typeof asset === 'string' ? asset : asset.id;
    const url = `${this.apiUrl}/${id}`;

    return this.http.delete<AssetModel>(url, httpOptions);
  }
}