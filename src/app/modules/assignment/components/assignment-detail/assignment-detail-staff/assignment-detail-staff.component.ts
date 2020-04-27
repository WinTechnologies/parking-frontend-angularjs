import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { AssignmentService } from '../../../services/assignment.service';
import { MatDialog } from '@angular/material';
import { EmployeeInfoComponent } from 'app/components/employees/employee-info/employee-info.component';
import { AssignmentEmployeesModalComponent } from '../../assignment-employees-modal/assignment-employees-modal.component';
import { AlertdialogComponent } from '../../../../../components/alertdialog/alertdialog.component';
import { LoaderService } from '../../../../../services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../../environments/environment';
import {TableColumnsEditModalComponent} from '../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-assignment-detail-staff',
  templateUrl: './assignment-detail-staff.component.html',
  styleUrls: ['./assignment-detail-staff.component.scss']
})
export class AssignmentDetailStaffComponent implements OnInit {

  @Input() projectId: number;
  @Input() permission: any;

  @Output() employeesCount = new EventEmitter<Number>();

  assignedEmployees: any[] = [];

  showFields = [];
  tableFields = [];
  isLoading = false;

  filterValue = '';
  employeeOriginal: any[] = [];
  displayedColumns = [
    {name: 'avatar', label: 'Avatar', isShow: true},
    {name: 'firstname', label: 'Firstname', isShow: true},
    {name: 'lastname', label: 'Lastname', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true}
  ];

  baseUrl = environment.baseAssetsUrl;

  constructor(
    private assignmentService: AssignmentService,
    private dialog: MatDialog,
    private loaderService: LoaderService,
    private toastrService: ToastrService,
  ) { }

  ngOnInit() {
    if (this.permission.isDelete) {
      this.displayedColumns.push({name: 'action', label: 'Action', isShow: true});
    }
    this.displayedColumns.forEach(field => {
      this.showFields.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });
    this.tableFields = this.showFields;

    this.initData();
  }

  private async initData() {
    try {
      this.loaderService.enable();
      this.assignedEmployees = await this.assignmentService.getEmployeesByProject(this.projectId);
      this.employeesCount.emit(this.assignedEmployees ? this.assignedEmployees.length : 0);
      this.fetchMatTable(this.assignedEmployees);
    } finally {
      this.loaderService.disable();
    }
  }

  fetchMatTable(employees: any[]): void {
    this.employeeOriginal = employees;
  }

  public editColumns() {
    const dialogRef = this.dialog.open(TableColumnsEditModalComponent, {
      width: '550px',
      data : {
        showFields: this.showFields,
        originFields: this.displayedColumns,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showFields = result;
        this.tableFields = this.showFields.filter(field => field.isShow);
      }
    });
  }

  public reorderColumns(event) {
    const newValue = this.tableFields[event.newValue];
    const prevValue = this.tableFields[event.prevValue];
    const newIndex = this.showFields.indexOf(newValue);
    const prevIndex = this.showFields.indexOf(prevValue);
    let i = 0 ;
    this.showFields = this.showFields.map(value => {
      value = i === newIndex ? prevValue : value;
      value = i === prevIndex ? newValue : value;
      i++;
      return value;
    });
    this.tableFields = this.showFields.filter(field => field.isShow);
  }

  public applyFilterEmployee(filterValue: string) {
    this.filterValue = filterValue;
    this.filterTable();
  }

  filterTable() {
    let filterValue = this.filterValue;
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.employeeOriginal) {
      this.assignedEmployees = this.employeeOriginal.filter(row => {
        let bRet = true;
        let cRet = false;
        this.tableFields.forEach(value => {
          if (row[value.name]) {
            cRet = cRet || (row[value.name].toString().toLowerCase().indexOf(filterValue) >= 0);
          }
        });
        bRet = bRet && cRet;
        return bRet;
      });
    }
  }

  showAssignEmployeesModal() {
    const employeesModalRef = this.dialog.open(AssignmentEmployeesModalComponent, {
      width: '80%',
      data: { projectId: this.projectId, assignedEmployees: this.assignedEmployees }
    });
    employeesModalRef.afterClosed()
      .subscribe((result) => {
        if (result) {
          this.initData();
        }
      })
    ;
  }

  public onSelect(event: any) {
    if (event.type === 'click') {
      event.rowElement.className = event.rowElement.className + ' selectedRow';
      const dialogRef = this.dialog.open(EmployeeInfoComponent, {
        width: '90%',
        data: {employee: event.row}
      });
      dialogRef.afterClosed().subscribe(result => {
        $('.datatable-body-row.selectedRow').removeClass('selectedRow');
      });
    }
  }

  public onDelete(employee: any) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          this.loaderService.enable();
          await this.assignmentService.unAssignEmployee(employee.project_employee_id);
          await this.initData();
          this.toastrService.success('The employee is unassigned successfully!', 'Success!');
        } catch (e) {
          this.toastrService.error(e.error ? e.error : 'Something went wrong', 'Error!');
        } finally {
          this.loaderService.disable();
        }
      }
    });
  }

}
