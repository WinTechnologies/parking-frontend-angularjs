import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class DefaultValueService {

  private defaultValueUrl = '/pg/default-values';

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
  ) { }

  getDefaultValues(type: string): Promise<any> {
    const apiUrl = this.makeUrl(type);
    return this.apiService.get(apiUrl);
  }

  getDefaultValue(type: string, id: number): Promise<any> {
    const apiUrl = this.makeUrl(type, id);
    return this.apiService.get(apiUrl);
  }

  createDefaultValue(type: string, defaultValue: number): Promise<any> {
    const apiUrl = this.makeUrl(type);
    return this.apiService.post(apiUrl, defaultValue);
  }

  updateDefaultValue(type: string, defaultValue: any): Promise<any> {
    const apiUrl = this.makeUrl(type, defaultValue.id);
    return this.apiService.put(apiUrl, defaultValue);
  }

  deleteDefaultValue(type: string, id: number): Promise<any> {
    const apiUrl = this.makeUrl(type, id);
    return this.apiService.delete(apiUrl);
  }

  private makeUrl(type: string, id?: number): string {
    const apiUrl = `${this.defaultValueUrl}/${type}`;
    return id ? `${apiUrl}/${id}` : apiUrl;
  }
}
