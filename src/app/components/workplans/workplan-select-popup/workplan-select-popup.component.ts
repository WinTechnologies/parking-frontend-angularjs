import { Component, Inject, OnInit } from '@angular/core';
import { PgWorkplanService } from '../workplan.service';
import { PgEmployeeWpService } from '../../employees/employee-wp.service';
import { ToastrService } from 'ngx-toastr';
import { Workplan } from '../models/workplan.model';
import { Router } from '@angular/router';
import {Location} from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { EmployeeWp } from '../../employees/models/employee.model';

@Component({
  selector: 'app-workplan-select-popup',
  templateUrl: './workplan-select-popup.component.html',
  styleUrls: ['./workplan-select-popup.component.scss']
})

export class WorkplanSelectPopupComponent implements OnInit {
  employeeId = null;
  workplans: Workplan[];
  fitleredWorkplans: Workplan[];
  selectedIndex = null;
  seeAll = false;

  constructor(
    private readonly workplanService: PgWorkplanService,
    private readonly employeewpService: PgEmployeeWpService,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private location: Location,
    public dialogRef: MatDialogRef<WorkplanSelectPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
  ) { }

  async ngOnInit() {
    this.getWorkplans();
  }

  private getWorkplans() {
    this.workplanService.get().subscribe(res => {
      this.workplans = res;
      this.fitleredWorkplans = this.workplans;
    });
  }

  public onSelectWorkplan(i: number) {
    this.selectedIndex = i;
  }

  public changeSeeAll() {
    this.seeAll = !this.seeAll;
  }

  public onBack() {
    this.location.back();
  }

  public applyFilterWorkplan(filter) {
    filter = filter.trim().toLowerCase();
    this.fitleredWorkplans = this.workplans.filter(workplan => {
      return (workplan.wp_name.toLocaleLowerCase().indexOf(filter) >= 0);
    });
  }

  public onAddWorkplan() {
    const employeewp = new EmployeeWp();
    employeewp.employee_id = this.matDialogData.employeeId;
    employeewp.workplan_id = this.fitleredWorkplans[this.selectedIndex].id;
    employeewp.wp_reoccuring_id = '{' + this.fitleredWorkplans[this.selectedIndex].reoccurings.map(v => v.id).join(',') + '}';
    employeewp.wp_exception_id = '{' + this.fitleredWorkplans[this.selectedIndex].exceptions.map(v => v.id).join(',') + '}';

    this.employeewpService.create([employeewp]).subscribe(res => {
      this.toastr.success('This workplan is assigned successfully!', 'Success!');
      this.dialogRef.close({success: true});
    });
  }

  public onCancel() {
    this.dialogRef.close({success: false});
  }
}