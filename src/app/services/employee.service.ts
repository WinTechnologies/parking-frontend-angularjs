
import {map} from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { Observable ,  of } from 'rxjs';
import { Employee } from '../shared/classes/employee';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable()
export class EmployeeService {

  private employeeUrl = `${this.apiEndpoint}/pg/employee`;
  private headers = new HttpHeaders({'Content-Type': 'application/json'
  // , 'Authorization': 'localStorage.getItem('user')'
  });

  public showEmployee: Employee [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
   }


  /** GET Employees from the server */
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.employeeUrl, {headers: this.headers}).pipe(
            map(response => {
                // if (!Array.isArray(response)) { response = Object.values(Object.values(response)[0]); }
                return response.map(x =>
                    new Employee(
                      x.id ,
                      x.employee_id ,
                      x.firstname ,
                      x.lastname ,
                      x.phone_number ,
                      x.job_position,
                      x.address ,
                      x.department ,
                      x.landline ,
                      x.email ,
                      x.sex ,
                      x.day_of_birth ,
                      x.date_start,
                      x.date_end,
                      x.supervisor_id ,
                      x.picture ));
    }));
  }

  // getEmployeeById(id: string): Observable<Employee> {
  //   const url = `${this.employeeUrl}/id?id=${id}`;
  //   return this.http.get<Employee>(url, {headers: this.headers})
  //     .map(x => {
  //       new Employee(
  //         x.id ,
  //         x.employee_id ,
  //         x.firstname ,
  //         x.lastname ,
  //         x.phone_number ,
  //         x.job_position,
  //         x.address ,
  //         x.department ,
  //         x.landline ,
  //         x.email ,
  //         x.sex ,
  //         x.day_of_birth ,
  //         x.date_start,
  //         x.date_end,
  //         x.supervisor_id ,
  //         x.picture);
  //   });
  // }

  // /** POST: add a new Employee to the server */
  // addEmployee (employee: Employee): Observable<Employee> {
  //   return this.http.post<Employee>(this.employeeUrl, employee, {headers: this.headers});
  // }

  /** PUT: update the Employee on the server */
  updateEmployee (employee: Employee): Observable<any> {
    return this.http.put<Employee>(this.employeeUrl, employee, {headers: this.headers});
  }

  // /** DELETE: delete the Employee from the server */
  // deleteEmployee (employee: Employee): Observable<Employee> {
  //   const uid = typeof employee === 'string' ? employee : employee.uid;
  //   const url = `${this.employeeUrl}?uid=${uid}`;

  //   return this.http.delete<Employee>(url, {headers: this.headers});
  // }
}
