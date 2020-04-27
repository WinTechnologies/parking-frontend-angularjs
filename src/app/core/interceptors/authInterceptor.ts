import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastrService: ToastrService,
  ) { }

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    const { token: accessToken } = this.authService.getUserDataFromLocal();

    if (accessToken) {
      if (this.authService.tokenIsInvalid(accessToken)) {
        this.authService.clearUserData();
        const routerStateSnapShot = this.router.routerState.snapshot;
        this.authService.setRedirectUrl(routerStateSnapShot.url);
        this.toastrService.warning('Your session has expired, please login again', 'Error!');
        this.router.navigate(['/login']);
        return;
      }

      const cloned = req.clone({
        headers: req.headers.set('Authorization', accessToken)
      });

      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
