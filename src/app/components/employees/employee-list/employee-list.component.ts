import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../../services/current-user.service';
import { LoaderService } from '../../../services/loader.service';
import { PgEmployeeService } from '../employee.service';
import { Employee } from '../models/employee.model';
import { AlertdialogComponent } from '../../alertdialog/alertdialog.component';
import { DataGridComponent } from '../../../shared/components/data-grid/data-grid.component';
import { MatTableDefinitionService } from '../../../services/mat-table-definition.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  @ViewChild(DataGridComponent) dataGrid;

  tableName: string = MatTableDefinitionService.TABLE_EMPLOYEE;

  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  constructor(
    private employeeService: PgEmployeeService,
    private router: Router,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private currentUserService: CurrentUserService,
    private loaderService: LoaderService,
  ) {
  }

  async ngOnInit() {
    try {
      const currentUser = await this.currentUserService.get();
      this.permission = CurrentUserService.canFeature(currentUser, 'hr_employee');

      this.getEmployees();
    } finally {
    }
  }

  getEmployees() {
    this.loaderService.enable();

    const untilGetEmployees = new Subject<boolean>();
    this.employeeService.getWithProjectName()
      .takeUntil(untilGetEmployees)
      .subscribe(employees => {
        this.dataGrid.setData(employees);

        this.loaderService.disable();

        untilGetEmployees.next(true);
        untilGetEmployees.complete();
      });
  }

  onRowSelect(employee: Employee, newPage = false) {
    if (!this.permission.isUpdate) {
      this.currentUserService.showNotAccessToastr();
      return;
    }

    if (newPage) {
      window.open(`/employees/${employee.employee_id}`);
      return;
    }

    this.router.navigate(['employees', employee.employee_id]);
  }

  onAddEmployee() {
    this.router.navigate(['employees/create']);
  }

  onDelete(employee: Employee): void {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: `This action is not reversible! Are you sure you want to deactivate ${employee.firstname} ${employee.lastname}?`,
        btnOk: 'Ok',
        btnCancel: 'Cancel',
      },
    });

    const untilClosed = new Subject<boolean>();
    dialogRef.afterClosed()
      .takeUntil(untilClosed)
      .subscribe(result => {
        if (result) {
          const untilDelete = new Subject<boolean>();
          this.employeeService.deleteEmployee(employee)
            .takeUntil(untilDelete)
            .subscribe(() => {
              this.toastr.success('The employee is deactivated successfully!', 'Success!');

              untilDelete.next(true);
              untilDelete.complete();

              this.getEmployees();
            });
        }

        untilClosed.next(true);
        untilClosed.complete();
      });
  }
}
