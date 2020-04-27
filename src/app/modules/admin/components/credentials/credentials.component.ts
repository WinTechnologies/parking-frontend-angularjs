import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Employee } from '../../../../components/employees/models/employee.model';
import { PgEmployeeService } from '../../../../components/employees/employee.service';
import { LoaderService } from '../../../../services/loader.service';
import { CurrentUserService } from '../../../../services/current-user.service';
import { Page } from '../../models/page.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-credentails',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
})

export class CredentialsComponent implements OnInit {
  employees: Employee[] = [];

  employeeOriginal: Employee[];
  employee_name: string;
  page = new Page();
  rows = new Array<Employee>();

  // Employee List Permission
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  showFields = [];
  tableFields = [];
  originFields = [];
  isLoading = false;
  today = new Date();
  filterValue = '';

  displayedColumns = [
    {name: 'avatar', label: 'Avatar', isShow: true},
    {name: 'firstname', label: 'Firstname', isShow: true},
    {name: 'lastname', label: 'Lastname', isShow: true},
    {name: 'employee_id', label: 'Employee ID', isShow: true},
    {name: 'department', label: 'Department', isShow: true},
    {name: 'job_position', label: 'Position', isShow: true},
    {name: 'phone_number', label: 'Mobile', isShow: true},
    {name: 'working_status', label: 'Status', isShow: true}
  ];

  constructor(
    private readonly employeeService: PgEmployeeService,
    private loaderService: LoaderService,
    private currentUserService: CurrentUserService,
    private readonly router: Router,
    private activatedRoute: ActivatedRoute,
    public location: Location,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
      this.employeeService.getCount().subscribe( result => {
      this.page.totalElements = result.count;
    });
  }

  async ngOnInit() {
    try {
      const currentUser = await this.currentUserService.get();
      this.permission = CurrentUserService.canFeature(currentUser, 'hr_employee');
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
      this.getEmployees();
      // this.setPage({ offset: 0 });
    } finally {

    }
  }

  setPage(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.page.pageNumber = pageInfo.offset;

    this.employeeService.getCredentialEmployees(this.page)
      .subscribe( result  => {
        this.employees = result;
        this.rows = [...this.employees];
      });
  }

  private getEmployees(): void {
    this.loaderService.enable();
    this.isLoading = true;
    this.employeeService.get().subscribe(res => {
      this.employees = res;

      this.employeeOriginal = this.employees;
      this.loaderService.disable();
    });
    this.isLoading = false;
  }

  public onSelect(event) {
    if (event.type === 'click') {
      const employee = event.row;
      if (!this.permission.isUpdate) {
        this.currentUserService.showNotAccessToastr();
        return;
      }
      this.router.navigate(['admin/credentials/update-details', employee.id]);
    }
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
      this.employees = this.employeeOriginal.filter(row => {
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
}