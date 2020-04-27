import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PgListCityService } from '../assets/services/list-city.service';

@Injectable()
export class ListCityResolve implements Resolve<any> {
  constructor(
    private listCityService: PgListCityService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.listCityService.getAllWithProjects();
  }
}