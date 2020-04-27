import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable()
export class AssignmentService {

  constructor(
    private apiService: ApiService,
  ) { }

  // TODO: Note - Duplicated with projects.service -> get()
  getProject(id): Promise<any> {
    const apiUrl = '/pg/projects';
    return this.apiService.get(apiUrl, {id});
  }

  // TODO: Note - Move to projects.service -> getAllWithActivity()
  getProjects(): Promise<any> {
    const apiUrl = '/pg/projects/with-activity';
    return this.apiService.get(apiUrl);
  }

  getEmployees(): Promise<any> {
    const apiUrl = '/pg/employees';
    return this.apiService.get(apiUrl);
  }

  // TODO: Note - Duplicated with project-employee.service -> getEmployeesByProject()
  getEmployeesByProject(project_id): Promise<any> {
    const apiUrl = '/pg/project-employee/employees';
    return this.apiService.get(apiUrl, {project_id});
  }

  assignEmployees(employees, project_id) {
    const apiUrl = '/pg/project-employee/create-bulk';
    return this.apiService.post(apiUrl, {employees, project_id});
  }

  unAssignEmployee(project_employee_id) {
    const apiUrl = `/pg/project-employee/${project_employee_id}`;
    return this.apiService.delete(apiUrl);
  }
}
