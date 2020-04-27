import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Workplan } from '../models/workplan.model';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PgWorkplanService } from '../workplan.service';
import { Reoccuring } from '../workplan-new/reoccurings/models/reoccurings.model';
import { Exception } from '../workplan-new/exceptions/models/exceptions.model';
import { PgReoccuringService } from '../workplan-new/reoccurings/reoccurings.service';
import { PgExceptionService } from '../workplan-new/exceptions/exceptions.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../../services/current-user.service';

@Component({
  selector: 'app-workplan-details',
  templateUrl: './workplan-details.component.html',
  styleUrls: ['./workplan-details.component.scss']
})

export class WorkplanDetailsComponent implements OnInit, OnChanges {
  @Input() workplan_id: number;
  @Input() workplan_name: string;
  @Input() employeeId: string = null;

  workplan: Workplan;
  reoccurings: Reoccuring[] = [new Reoccuring()];
  exceptions: Exception[] = [];
  deleteReoccurings = [];
  deleteExceptions = [];

  // Permission Feature
  canUpdate: boolean;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private readonly workplanService: PgWorkplanService,
    private readonly reoccuringService: PgReoccuringService,
    private readonly exceptionService: PgExceptionService,
    private readonly toastr: ToastrService,
    private currentUserService: CurrentUserService,
  ) {
    this.route.params.subscribe(params => {
      if (params['name']) {
        this.workplan_name = params['name'];
        this.getWorkplan();
      }
    });
  }

  async ngOnInit() {
    const currentUser: any = await this.currentUserService.get();
    this.canUpdate = CurrentUserService.canUpdate(currentUser, 'hr_workplan');
    this.getWorkplan();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.workplan_name && this.workplan_name) {
      this.getWorkplan();
    }
  }

  private getWorkplan() {
    const param = {};
    if (this.workplan_id) {
      param['id'] = this.workplan_id;
    } else {
      param['wp_name'] = this.workplan_name;
    }

    if (!this.employeeId) {
      this.workplanService.get(param).subscribe(res => {
        if (res.length) {
          this.workplan = res[0];
          this.workplan_id = this.workplan.id;
          this.workplan_name = this.workplan.wp_name;
          if (this.workplan.reoccurings.length) {
            this.reoccurings = JSON.parse(JSON.stringify(this.workplan.reoccurings));
          }
          this.exceptions = JSON.parse(JSON.stringify(this.workplan.exceptions));
        }
      });
    } else {
      this.workplanService.getEmployeeWorkplan(this.employeeId).subscribe(res => {
        this.workplan = res;
        this.workplan_id = this.workplan.id;
        this.workplan_name = this.workplan.wp_name;
        if (this.workplan.reoccurings.length) {
          this.reoccurings = JSON.parse(JSON.stringify(this.workplan.reoccurings));
        }
        this.exceptions = JSON.parse(JSON.stringify(this.workplan.exceptions));
      });
    }
  }

  public onBack() {
    this.location.back();
  }

  public onApplyReoccuring() {
    if (!this.employeeId) {
      this.workplanService.updateReoccurings(this.workplan, this.reoccurings, this.deleteReoccurings)
        .subscribe(res => {
          this.toastr.success('The reoccurings are updated successfully!', 'Success!');
          this.getWorkplan();
        });
    } else {
      this.workplanService.updateEmployeeReoccurings(this.employeeId, this.workplan, this.reoccurings)
        .subscribe(res => {
          this.toastr.success('This employee\'s reoccurings are updated successfully!', 'Success!');
          this.getWorkplan();
        });
    }
  }

  public onCancelReoccuring() {
    if (this.workplan.reoccurings) {
      this.reoccurings = JSON.parse(JSON.stringify(this.workplan.reoccurings));
    } else {
      this.reoccurings = [new Reoccuring()];
    }
    this.deleteReoccurings = [];
  }

  public onCancelExceptions() {
    if (this.workplan.reoccurings) {
      this.exceptions = JSON.parse(JSON.stringify(this.workplan.exceptions));
    } else {
      this.exceptions = [new Exception()];
    }
    this.deleteExceptions = [];
  }

  public onApplyExceptions() {
    if (!this.employeeId) {
      this.workplanService.updateExceptions(this.workplan, this.exceptions, this.deleteExceptions)
        .subscribe(res => {
          this.toastr.success('The exceptions are updated successfully!', 'Success!');
          this.getWorkplan();
        });
    } else {
      this.workplanService.updateEmployeeExceptions(this.employeeId, this.workplan, this.exceptions)
        .subscribe(res => {
          this.toastr.success('This employee\'s exceptions are updated successfully!', 'Success!');
          this.getWorkplan();
        });
    }
  }

  checkValidReoccuring() {
    let valid = true;
    this.reoccurings.forEach(el => {
      if (!el.working_days || !el.reoccuring_name) {
        valid = false;
      }
    });
    return valid;
  }

  public onAddReoccuring() {
    const reoccuring = new Reoccuring();
    this.reoccurings.push(reoccuring);
  }

  public onRemoveReoccuring(index: number) {
    if (this.reoccurings[index].id) {
      this.deleteReoccurings.push(this.reoccurings[index].id);
    }
    this.reoccurings.splice(index, 1);
  }

  public onAddException() {
    const exception = new Exception();
    this.exceptions.push(exception);
  }

  public onRemoveException(index: number) {
    if (this.exceptions[index].id) {
      this.deleteExceptions.push(this.exceptions[index].id);
    }
    this.exceptions.splice(index, 1);
  }

  checkValidException() {
    let valid = true;
    if (this.exceptions && this.exceptions.length) {
      this.exceptions.forEach(ex => {
        if (!ex.exception_name || !ex.applied_dates) {
          valid = false;
        }
      });
    }
    return valid;
  }
}