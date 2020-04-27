import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Employee } from '../../../../../components/employees/models/employee.model';
import { PgEmployeeService } from '../../../../../components/employees/employee.service';

@Component({
  selector: 'app-update-details',
  templateUrl: './update-details.component.html',
  styleUrls: ['./update-details.component.scss']
})

export class EmployeeUpdateDetailsComponent implements OnInit {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  employee: Employee;
  employeeEditForm: FormGroup;
  canUpdate = true;
  today = new Date();

  genders = [
    {value: 0, name: 'Female'},
    {value: 1, name: 'Male'}
  ];

  constructor(
    private readonly employeeService: PgEmployeeService,
    private readonly toastrService: ToastrService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {
    this.route.params.subscribe(params => {
      if (params['id']) {
        const id = params['id'];
        this.getEmployee(id);
      }
    });
  }

  ngOnInit() {
    this.initForm();
  }

  getEmployee(employeeId) {
    this.employeeService.getEmployee(employeeId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.employee = res;
        }
      }, err => {
        if (err.error && err.error.message) {
          this.toastrService.error(err.error.message, 'Error');
        } else if (err.error && err.error.error) {
          this.toastrService.error(err.error.error, 'Error');
        }
      });
  }

  private initForm() {
    this.employeeEditForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
    });
  }

  public onUpdate() {
    if (this.employeeEditForm.valid) {
      const formValue = this.employeeEditForm.value;
      const password = formValue.password;
      const confirm_password = formValue.confirm_password;

      if( password !== confirm_password) {
        this.toastr.error('New password and confirmation password do not match.', 'Error!');
      } else {
        const newEmployee = new Employee();
        newEmployee.password = password;
        newEmployee.employee_id = this.employee.employee_id;

        this.employeeService.setResetCredentials(newEmployee).subscribe(res => {
          if (res.success) {
            this.toastrService.success(res.message);
          } else {
            this.toastrService.error(res.message);
          }
        });
        this.router.navigate(['admin/credentials']);
      }
    }
  }

  public onCancel() {
    this.router.navigate(['admin/credentials']);
  }
}