import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { Employee } from '../../components/employees/models/employee.model';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class AuthService {
  token: any;
  user: any;

  private redirectUrl = '';
  private tokenHelper = new JwtHelperService();
  public authStatusSub = new BehaviorSubject<boolean>(false);

  constructor(
      protected httpClient: HttpClient,
      private router: Router,
      @Inject('API_ENDPOINT') private apiEndpoint: string,
  ) {
  }

  authenticateUser(user) {
    return this.httpClient.post(`${this.apiEndpoint}/auth/`, user, httpOptions);
  }

  sendResetPasswordEmail(email: string): Observable<any> {
    return this.httpClient.put(`${this.apiEndpoint}/auth/resetPassword`, {username: email}, httpOptions);
  }

  getProfile(): Observable<Employee> {
    const employeeUrl = `${this.apiEndpoint}/pg/employees/${this.user.employee_id}`;
    return this.httpClient.get<Employee>(employeeUrl);
  }

  private emitAuthStatusChange(newStatus: boolean): void {
    if (this.authStatusSub.getValue() !== newStatus) {
      this.authStatusSub.next(newStatus);
    }
  }

  public onLoginSuccess(token, user): void {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));

    this.token = token;
    this.user = user;

    this.emitAuthStatusChange(true);
    this.router.navigate([this.getRedirectUrl() || '']);
  }

  public autoLoadAuthData(): void {
    const { token, user } = this.getUserDataFromLocal();
    if (!token || this.tokenIsInvalid(token)) {
      this.clearUserData();
      this.emitAuthStatusChange(false);
      this.router.navigate(['/login']);
      return;
    }

    this.emitAuthStatusChange(true);
    this.token = token;
    this.user = user;
  }

  public tokenIsInvalid(token: string): boolean {
    if (token) {
      const isTokenExpired = this.tokenHelper.isTokenExpired(token);
      this.emitAuthStatusChange(!isTokenExpired);
      return isTokenExpired;
    } else {
      this.emitAuthStatusChange(false);
      return true;
    }
  }

  public getUserDataFromLocal() {
    return {
      token: localStorage.getItem('id_token'),
      user: JSON.parse(localStorage.getItem('user')),
    };
  }

  public clearUserData(): void {
    localStorage.clear();
    if (this.redirectUrl) {
      localStorage.setItem('redirect_url', this.redirectUrl);
    }

    this.token = null;
    this.user = null;
  }

  public setRedirectUrl(url): void {
    this.redirectUrl = url;
    localStorage.setItem('redirect_url', url);
  }

  public getRedirectUrl(): string {
    if (!this.redirectUrl) {
      this.redirectUrl = localStorage.getItem('redirect_url');
    }
    return this.redirectUrl;
  }
}
