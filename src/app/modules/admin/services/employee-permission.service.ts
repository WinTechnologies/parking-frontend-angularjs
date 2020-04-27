import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { EmployeePermission } from '../models/shared.model';
import { Employee } from '../../../components/employees/models/employee.model';

const employeePermissionApiUrl = '/pg/admin/employee-permissions';

@Injectable()
export class EmployeePermissionService {
  constructor(
    private apiService: ApiService,
  ) { }

  getAll(params: Object = {}): Promise<Employee[]> {
    return this.apiService.get(employeePermissionApiUrl, params);
  }

  getByPermissions(params = {}) {
    const apiUrl = `${employeePermissionApiUrl}/by-permission`;
    return this.apiService.get(apiUrl, params);
  }

  getOne(employee_id): Promise<Employee> {
    const apiUrl = `${employeePermissionApiUrl}/${employee_id}`;
    return this.apiService.get(apiUrl);
  }

  create(employeePermission: EmployeePermission) {
    return this.apiService.post(employeePermissionApiUrl, employeePermission);
  }

  update(employeePermission: EmployeePermission) {
    const apiUrl = `${employeePermissionApiUrl}/${employeePermission.employee_id}`;
    return this.apiService.put(apiUrl, EmployeePermission);
  }

  delete(employee_id: string) {
    const apiUrl = `${employeePermissionApiUrl}/${employee_id}`;
    return this.apiService.delete(apiUrl);
  }

  createBulk(employees: string[], permission_template_id: number) {
    const apiUrl = `${employeePermissionApiUrl}/create-bulk`;
    return this.apiService.post(apiUrl, {employees, permission_template_id});
  }

  updateBulk(employees: string[], permission_template_id: number) {
    const apiUrl = `${employeePermissionApiUrl}/update-bulk`;
    return this.apiService.post(apiUrl, {employees, permission_template_id});
  }

  deleteBulk(employees: string[]) {
    const apiUrl = `${employeePermissionApiUrl}/delete-bulk`;
    return this.apiService.post(apiUrl, {employees});
  }
}