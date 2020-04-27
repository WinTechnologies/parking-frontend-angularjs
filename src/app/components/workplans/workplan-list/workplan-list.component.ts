import { Component, OnInit } from '@angular/core';
import { PgWorkplanService } from '../workplan.service';
import { Workplan } from '../models/workplan.model';
import { Router } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { ToastrService } from 'ngx-toastr';
import { AlertdialogComponent } from '../../alertdialog/alertdialog.component';
import { MatDialog } from '@angular/material';
import { Util } from 'leaflet';
import indexOf = Util.indexOf;
import { PgEmployeeWpService } from '../../employees/employee-wp.service';
import { forkJoin } from 'rxjs';
import { PgReoccuringService } from '../workplan-new/reoccurings/reoccurings.service';
import { PgExceptionService } from '../workplan-new/exceptions/exceptions.service';

@Component({
  selector: 'app-workplan-list',
  templateUrl: './workplan-list.component.html',
  styleUrls: ['./workplan-list.component.scss']
})

export class WorkplanListComponent implements OnInit {
  workplans: Workplan[];
  fitleredWorkplans: Workplan[];

  // Permission Feature
  currentUser: any;
  canCreate = CurrentUserService.canCreate;
  canDelete = CurrentUserService.canDelete;

  constructor(
    private readonly workplanService: PgWorkplanService,
    private readonly router: Router,
    private readonly datePipe: DatePipe,
    private location: Location,
    private authService: AuthService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private currentUserService: CurrentUserService,
    private employeeWpService: PgEmployeeWpService,
    private exceptionService: PgExceptionService,
    private reoccuringsService: PgReoccuringService,
  ) { }

  async ngOnInit() {
    this.currentUser = await this.currentUserService.get();
    this.getWorkplans();
  }

  private getWorkplans() {
    this.workplanService.get().subscribe(res => {
      this.workplans = res;

      this.workplans.forEach(workplan => {
        if (workplan.exceptions && workplan.exceptions.length) {
          workplan.exceptions.forEach(exception => {
            const dates = exception.applied_dates.split(',');
            const appliedDates = [];
            dates.forEach(date => {
              appliedDates.push(this.datePipe.transform(new Date(date), 'dd/MM/yyyy'));
            });
            exception.applied_dates = appliedDates.join(', ');
          });
        }
      });
      this.fitleredWorkplans = this.workplans;
    });
  }

  public onCreateWorkplan() {
    this.router.navigate(['workplans/create']);
  }

  public onBack() {
    this.location.back();
  }

  public onViewAll(workplan: Workplan) {
    this.router.navigate(['workplans/details', {name: workplan.wp_name}]);
  }

  public onDelete(workplan: Workplan) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: `This workplan is in used by ${(workplan as any).employees.length} employees. Once the workplan is deleted, the employees that linked to the workplan will be detached.<br>` +
          `This action is not reversible! Are you sure you want to delete ?`,
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        forkJoin (
          this.workplanService.delete(workplan),
          this.exceptionService.deleteByWP(workplan),
          this.reoccuringsService.deleteByWP(workplan),
          this.employeeWpService.delete(workplan),
        ).subscribe(() => {
          this.toastr.success('The workplan is deleted successfully!', 'Success!');
          this.getWorkplans();
        });
      }
    });
  }

  public applyFilterWorkplan(filter) {
    filter = filter.trim().toLowerCase();
    this.fitleredWorkplans = this.workplans.filter( workplan => {
      return (workplan.wp_name.toLocaleLowerCase().indexOf(filter) >= 0);
    });
  }
}