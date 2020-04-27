import { Component, Inject, OnInit } from '@angular/core';
import { Workplan } from '../../../workplans/models/workplan.model';
import { Project } from '../../../projects/models/project.model';
import { PgProjectEmployeeService } from '../../../projects/services/project-employee.service';
import { PgEmployeeWpService } from '../../employee-wp.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Employee, EmployeeWp } from '../../models/employee.model';
import { ToastrService } from 'ngx-toastr';
import { ProjectEmployee } from '../../../projects/models/project-employee.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-project-dialog',
  templateUrl: './add-project-dialog.component.html',
  styleUrls: ['./add-project-dialog.component.scss']
})

export class AddProjectDialogComponent implements OnInit {
  selectedProjects: Project[] = [];
  selectedWorkplans: Workplan[] = [];
  employee: Employee;

  constructor(private projectEmployeeService: PgProjectEmployeeService,
              private employeeWpService: PgEmployeeWpService,
              private toastrService: ToastrService,
              public dialogRef: MatDialogRef<AddProjectDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.employee = this.data.employee;
  }

  ngOnInit() {

  }

  onSelectedProjects(projects: Project[]) {
    this.selectedProjects = projects;
  }

  onSelectedWorkplans(workplans: Workplan[]) {
    this.selectedWorkplans = workplans;
  }

  onSubmit() {
    if (this.selectedProjects.length === 0) {
      this.toastrService.error('You have to choose a project and a workplan', 'Error!');
      return;
    }

    const observable = [];
    this.selectedProjects.forEach(selectedProject => {
      const projectEmployee = new ProjectEmployee();
      projectEmployee.employee_id = this.employee.employee_id;
      projectEmployee.project_id = selectedProject.id;
      projectEmployee.start_date = new Date();
      projectEmployee.end_date = selectedProject.end_date;
      observable.push(this.projectEmployeeService.create(projectEmployee));
    });

    this.selectedWorkplans.forEach(selectedWorkplan => {
      const employeeWp = new EmployeeWp();
      employeeWp.employee_id = this.employee.employee_id;
      employeeWp.workplan_id = selectedWorkplan.id;
      employeeWp.wp_reoccuring_id = '{' + selectedWorkplan.reoccurings.map(v => v.id).join(',') + '}';
      employeeWp.wp_exception_id = '{' + selectedWorkplan.exceptions.map(v => v.id).join(',') + '}';
      observable.push(this.employeeWpService.create([employeeWp]));
    });

    forkJoin(observable).subscribe(res => {
      this.toastrService.success('The project has been successfully assigned', 'Success!');
      this.dialogRef.close({success: true});
    }, err => {
      console.log(err);
      this.toastrService.error(err.error.message, 'Error!');
      this.dialogRef.close({success: false});
    });
  }

  onCancel() {
    this.dialogRef.close({success: false});
  }
}