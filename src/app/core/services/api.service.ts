import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastrService: ToastrService,
  ) {}

  get(url: string, params: Object = {}): Promise<any> {
    const request = {
      method: 'get',
      url: this.makeFullUrl(url),
      httpOptions: this.makeHttpOptions({}, params)
    };
    return this.request(request);
  }

  post(url: string, body: Object = {}): Promise<any> {
    const request = {
      method: 'post',
      url: this.makeFullUrl(url),
      httpOptions: this.makeHttpOptions(body)
    };

    return this.request(request);
  }

  patch(url: string, body = {}): Promise<any> {
    const request = {
      method: 'patch',
      url: this.makeFullUrl(url),
      httpOptions: this.makeHttpOptions(body)
    };

    return this.request(request);
  }

  put(url: string, body = {}): Promise<any> {
    const request = {
      method: 'put',
      url: this.makeFullUrl(url),
      httpOptions: this.makeHttpOptions(body)
    };

    return this.request(request);
  }

  delete(url: string, params?: any): Promise<any> {
    const request = {
      method: 'delete',
      url: this.makeFullUrl(url),
      httpOptions: this.makeHttpOptions(undefined, params)
    };

    return this.request(request);
  }

  request(request: any) {
    return this.http.request(request.method, request.url, request.httpOptions).toPromise();
  }

  makeFullUrl(url: string): string {
    return environment.apiBase + url;
  }

  makeHttpOptions(body?: any, params?: any): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    if (body) {
      httpOptions['body'] = body;
    }

    if (params) {
      httpOptions['params'] = params;
    }

    return httpOptions;
  }

  private processHttpError<T> (result?: T) {
    return (errorResponse: HttpErrorResponse): Observable<T> => {
      console.log('apiService->processHttpError', errorResponse);
      switch (errorResponse.status) {
        case 401:
          this.router.navigate(['/login']);
          break;
        default:
          this.toastrService.error('API Error', 'Error!');
      }
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}