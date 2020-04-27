import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EmployeeInfoComponent } from '../../../../../components/employees/employee-info/employee-info.component';
import { MatDialog } from '@angular/material';
import { AuthService } from '../../../../../core/services/auth.service';

export enum GroupViewMode {
  ListView,
  FormView,
}

export enum Role {
  Member,
  Admin,
}

@Component({
  selector: 'app-library-groups',
  templateUrl: './library-groups.component.html',
  styleUrls: ['./library-groups.component.scss']
})

export class LibraryGroupsComponent implements OnInit, OnChanges {
  @Input() groups;
  @Input() employees;
  @Output() updateFlag = new EventEmitter();
  public groupViewMode = GroupViewMode;
  public Role = Role;
  private keyValue = '';
  public selectedGroup: any = {};
  public status: GroupViewMode;
  public form: FormGroup;
  public employeesFiltered: any = [];
  public groupsFiltered: any;
  public role: Role;
  public adminBy: any = [];
  public members: any = [];
  groupName = '';

  constructor(
    private analyticsService: AnalyticsService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private readonly dialog: MatDialog,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.status = GroupViewMode.ListView;
    this.role = Role.Admin;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.groupsFiltered = this.groups;
    this.employeesFiltered = this.employees;
    if (this.keyValue) {
      this.onSearchEmployee(this.keyValue);
    }
  }

  onAddGroup(group?: any) {
    if (group) {
      this.selectedGroup = group;
      this.adminBy = group.admins;
      this.members = group.members;
      this.groupName = this.selectedGroup.name;
    } else {
      this.selectedGroup = {};
      this.adminBy = this.employees.filter(e => e.employee_id === this.authService.user.employee_id);
      this.members = this.employees.filter(e => e.employee_id === this.authService.user.employee_id);
      this.groupName = '';
    }
    this.form = this.formBuilder.group({
      name: [this.selectedGroup ? this.selectedGroup.name : null, Validators.required],
      roles: [Role.Member, Validators.required],
    });
    this.status = GroupViewMode.FormView;
  }

  async onCreate() {
    if (this.form.valid) {
      if (this.members) {
        try {
          const memberIds = this.members.map(value => value.employee_id);
          const adminIds = this.adminBy.map(value => value.employee_id);
          if (this.selectedGroup.created_by) {
            await this.analyticsService.updateGroup(this.selectedGroup.id, {name: this.form.value.name, member: memberIds, admin_by: adminIds});
            this.toastrService.success('The group is updated successfully', 'Success');
          } else {
            await this.analyticsService.createGroup({name: this.form.value.name, member: memberIds, admin_by: adminIds});
            this.toastrService.success('The group is created successfully', 'Success');
          }
          this.status = GroupViewMode.ListView;
          this.updateFlag.emit(true);
          this.selectedGroup = {};
        } catch (e) {
          this.toastrService.error(e.error && e.error.message ? e.error.message : 'Something went wrong', 'Error');
        }
      } else {
        this.toastrService.error('Please select member', 'Error');
      }
    }
  }

  selectEmployee(event) {
    if (event.type === 'click') {
      const employee = event.row;
      if (this.status === GroupViewMode.FormView) {
        const newMember = this.members.filter(m => m.employee_id === employee.employee_id);
        if (this.form.value.roles === 1) {
          const newAdmin = this.adminBy.filter(m => m.employee_id === employee.employee_id);
          if (newAdmin.length === 0) {
            this.adminBy.push(employee);
          }
        }
        if (newMember.length === 0) {
          this.members.push(employee);
        }
      }
    }
  }

  public employeeInfo(employee: any) {
      this.dialog.open(EmployeeInfoComponent, {
        width: '90%',
        data: {employee: employee}
      });
  }

  onSearchEmployee(value: string) {
    this.keyValue = value;
    this.updateData();
  }

  updateData() {
    let filter = this.keyValue;
    this.employeesFiltered = this.employees;
    if (this.employeesFiltered && filter) {
      this.employeesFiltered = this.employeesFiltered.filter(row => {
        let bRet = false;
        const fullName = `${row.firstname} ${row.lastname}`;
        filter = filter.toLowerCase();
        if (fullName) {
          bRet = bRet || fullName.toLowerCase().indexOf(filter) >= 0;
        }
        if (row.job_position) {
          bRet = bRet || row.job_position.toLowerCase().indexOf(filter) >= 0;
        }
        return bRet;
      });
    }
  }

  onSearchGroup(value: string) {
    this.keyValue = value;
    this.updateGroup();
  }

  updateGroup() {
    const filter = this.keyValue;
    this.groupsFiltered = this.groups;
    if (this.groupsFiltered) {
      this.groupsFiltered = this.groupsFiltered.filter(row => {
        let bRet = true;
        if (filter) {
          bRet = bRet && (row.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0);
        }
        return bRet;
      });
    }
  }

  async removeEmployee(groupId, employeeId, index, indexOfMembers) {
    try {
      const result = await this.analyticsService.deleteGroupMember(employeeId, groupId);
      this.updateFlag.emit(true);
      this.groupsFiltered[index].members.splice(indexOfMembers, 1);
      this.toastrService.success(result.message, 'success');
    } catch (e) {
      this.toastrService.error(e.message ? e.message : 'Something is wrong', 'error');
    }
  }

  async ondeleteGroup(group, index) {
    try {
      const result = await this.analyticsService.deleteGroup(group.id);
      this.updateFlag.emit(true);
      this.groupsFiltered.splice(index, 1);
      this.toastrService.success(result.message, 'success');
    } catch (e) {
      this.toastrService.error(e.message ? e.message : 'Something is wrong', 'error');
    }
  }

  removeMember(index) {
    this.adminBy = this.adminBy.filter(admin => admin.employee_id !== this.members[index].employee_id);
    this.members.splice(index, 1);
  }

  removeAdmin(index) {
    this.adminBy.splice(index, 1);
  }

  onClose() {
    this.status = GroupViewMode.ListView;
  }
}