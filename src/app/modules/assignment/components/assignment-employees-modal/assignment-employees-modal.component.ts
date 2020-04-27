import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import { AssignmentService } from '../../services/assignment.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../../../services/loader.service';
import { environment } from '../../../../../environments/environment';
import {Employee} from '../../../../components/employees/models/employee.model';
import {TableColumnsEditModalComponent} from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-assignment-employees-modal',
  templateUrl: './assignment-employees-modal.component.html',
  styleUrls: ['./assignment-employees-modal.component.scss']
})
export class AssignmentEmployeesModalComponent implements OnInit {

  assignedEmployees: any[] = [];
  employees: any[] = [];
  employeesOrigin: Employee[];

  allChecked: boolean;

  displayedColumns = [
    {name: 'checkbox', label: 'Selection', isShow: true},
    {name: 'avatar', label: 'Picture', isShow: true},
    {name: 'firstname', label: 'First name', isShow: true},
    {name: 'lastname', label: 'Last name', isShow: true},
    {name: 'email', label: 'Email', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
  ];
  tableFields = [];
  showFields = [];
  selectedCount = 0;

  baseUrl = environment.baseAssetsUrl;

  constructor(
    private assignmentService: AssignmentService,
    public dialogRef: MatDialogRef<AssignmentEmployeesModalComponent>,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
    private loaderService: LoaderService,
  ) { }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      const employees = await this.assignmentService.getEmployees();
      const assignedEmployeeIds = this.matDialogData.assignedEmployees.map(employee => employee.employee_id);
      this.employees = employees.filter(employee => !assignedEmployeeIds.includes(employee.employee_id))
        .map((employee) => {
        return {...employee, checked: false};
      });
      this.employeesOrigin = this.employees;
    } finally {
      this.loaderService.disable();
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


  applyFilterEmployee(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.employeesOrigin) {
      this.employees = this.employeesOrigin.filter(row => {
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
    this.calculateSelectedCount();
  }

  public async onAdd() {
    try {
      this.loaderService.enable();
      const checkedEmployees = this.employees.filter(employee => employee['checked'])
        .map(employee => {
          return {
            employee_id: employee.employee_id,
            end_date: employee.end_date
          };
        });
      await this.assignmentService.assignEmployees(checkedEmployees, this.matDialogData.projectId);
      this.toastrService.success('The employee(s) is(are) assigned successfully!', 'Success');
      this.dialogRef.close(true);
    } catch (e) {
      this.toastrService.error(e.message.toString(), 'Error');
      this.dialogRef.close(false);
    } finally {
      this.loaderService.disable();
    }
  }

  public onCancel() {
    this.dialogRef.close(false);
  }

  checkAll() {
    this.employees.forEach(employee => {
      employee['checked'] = this.allChecked;
    });
    this.calculateSelectedCount();
  }

  public onSelect(event: any) {
    if (event.type === 'click') {
      event.row['checked'] = !event.row['checked'];
      this.calculateSelectedCount();
    }
  }

  public changeCheckItem() {
    this.calculateSelectedCount();
  }

  private calculateSelectedCount() {
    this.selectedCount = this.employees.filter(e => e['checked']).length;
  }

}
