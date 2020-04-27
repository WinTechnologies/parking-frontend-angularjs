import { Component, Inject, OnInit } from '@angular/core';
import { Employee } from '../models/employee.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { environment } from '../../../../environments/environment';
import { PgProjectEmployeeService } from '../../projects/services/project-employee.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-info',
  templateUrl: './employee-info.component.html',
  styleUrls: ['./employee-info.component.scss']
})

export class EmployeeInfoComponent implements OnInit {
  employee: Employee;
  baseUrl = environment.baseAssetsUrl;
  employee_projects: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly pgProjectEmployeeService: PgProjectEmployeeService,
    private readonly toastrService: ToastrService,
    public dialogRef: MatDialogRef<EmployeeInfoComponent>
  ) { }

  ngOnInit() {
    this.employee = this.data.employee;
    this.getProjects(this.employee.employee_id);
  }

  getProjects(employeeId) {
    this.pgProjectEmployeeService.getAssignedProjects(employeeId)
      .subscribe(res => {
        if (res) {
          this.employee_projects = res.sort((a, b) => a.project_id - b.project_id);
        }
      }, err => {
        if (err.error && err.error.message) {
          this.toastrService.error(err.error.message, 'Error');
        } else if (err.error && err.error.error) {
          this.toastrService.error(err.error.error, 'Error');
        }
      });
  }

  onClose() {
    this.dialogRef.close(false);
  }
}
