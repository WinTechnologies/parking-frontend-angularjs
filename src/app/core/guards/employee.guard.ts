import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AddProjectService } from '../../components/employees/add-project/add-project.service';

@Injectable()
export class EmployeeGuard implements CanActivate {
  constructor(private addProjectService: AddProjectService,
              private router: Router ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    return new Promise(resolve => {
      const checkEmployee = this.addProjectService.checkEmployee();
      if (!checkEmployee) {
        this.router.navigate(['employees/create']);
        resolve(false);
      }
      resolve(true);
    });
  }
}