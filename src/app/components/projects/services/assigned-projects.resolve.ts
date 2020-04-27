import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PgProjectEmployeeService } from './project-employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../models/project.model';

@Injectable()
export class AssignedProjectsResolve implements Resolve<any> {
  constructor(
    private authService: AuthService,
    private pgProjectEmployeeService: PgProjectEmployeeService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Project[]> {
    const employee = this.authService.user;
    if (employee && employee.employee_id) {
      return this.pgProjectEmployeeService.getAssignedProjects(employee.employee_id);
    } else {
      return Observable.of([]);
    }
  }
}
