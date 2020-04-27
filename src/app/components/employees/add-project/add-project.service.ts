import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';

@Injectable()
export class AddProjectService {
  employee: Employee;
  constructor() { }

  setEmployee(employee: Employee) {
    this.employee = employee;
  }

  getEmployee() {
    return this.employee;
  }

  checkEmployee(): boolean {
    return !!this.employee;
  }
}