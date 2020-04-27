import { Injectable } from '@angular/core';
import {
  Router, Route,
  CanActivate,
  CanActivateChild,
  CanLoad,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    const url: string = state.url;

    return this.checkEnabled(url);
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return this.canActivate(next, state);
  }

  canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
    const url = `/${route.path}`;

    return this.checkEnabled(url);
  }

  checkEnabled(url: string): boolean | Observable<boolean> | Promise<boolean> {
    const { token: accessToken } = this.authService.getUserDataFromLocal();
    if (this.authService.tokenIsInvalid(accessToken)) {
      this.authService.clearUserData();
      this.authService.setRedirectUrl(url);

      this.toastrService.warning('Your session has expired, please login again', 'Error!');
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }
}
