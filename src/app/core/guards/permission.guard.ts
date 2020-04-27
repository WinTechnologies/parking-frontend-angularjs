import { Injectable } from '@angular/core';
import { CurrentUserService } from '../../services/current-user.service';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class PermissionGuard implements CanActivate, CanLoad {
  constructor(
    private currentUserService: CurrentUserService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.checkEnabled(route);
  }

  canLoad(route: Route) {
    return this.checkEnabled(route);
  }

  private async checkEnabled(route) {
    const currentUser = await this.currentUserService.get();
    const { feature, type } = route.data['permission'];
    const enabled = CurrentUserService.canFeatureType(currentUser, feature, type);
    if (!enabled) {
      this.currentUserService.showNotAccessToastr();
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
      return false;
    }
    return true;
  }
}