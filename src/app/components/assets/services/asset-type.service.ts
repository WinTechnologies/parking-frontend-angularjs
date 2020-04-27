import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AssetType } from '../models/asset.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PgAssetTypeService {
  private apiUrl = `${this.apiEndpoint}/pg/asset-type`;

  constructor(
    private http: HttpClient,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  /** GET Asset Type from the server */
  public getAll(options?: any): Observable<AssetType[]> {
    return  this.http.get<AssetType[]>(this.apiUrl,  {params: options});
  }

  public getCategoryAsset(): Observable<Array<{id: number, category_asset: string}>> {
    const url = `${this.apiUrl}/category-asset`;
    return this.http.get<Array<{id: number, category_asset: string}>>(url);
  }

  /** POST: create a new Asset Type on the server */
  public create (assetType: AssetType): Observable<AssetType> {
    return this.http.post<AssetType>(this.apiUrl, assetType, httpOptions);
  }

  /** PUT: update the Asset Type on the server */
  public update (assetType: AssetType): Observable<any> {
    const id = assetType.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<AssetType>(url, assetType, httpOptions);
  }

  /** DELETE: delete the Asset Type on the server */
  public delete (assetType: AssetType): Observable<any> {
    const id = assetType.id;
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<AssetType>(url, httpOptions);
  }
}