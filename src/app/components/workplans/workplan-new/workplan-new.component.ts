import * as moment from 'moment';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { PgWorkplanService } from '../workplan.service';
import { Workplan } from '../models/workplan.model';
import { Exception } from './exceptions/models/exceptions.model';
import { Reoccuring } from './reoccurings/models/reoccurings.model';
import { ToastrService } from 'ngx-toastr';
import { PgReoccuringService } from './reoccurings/reoccurings.service';
import { PgExceptionService } from './exceptions/exceptions.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-workplan-new',
  templateUrl: './workplan-new.component.html',
  styleUrls: ['./workplan-new.component.scss']
})

export class WorkplanNewComponent implements OnInit {
  form: FormGroup;
  workplan: Workplan;
  reoccurings: Reoccuring[];
  exceptions: Exception[];
  valid = false;

  workplanAll: Workplan[] = [];
  exceptionAll: Exception[]  = [];
  reoccuringAll: Reoccuring[]  = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly location: Location,
    private readonly workplanService: PgWorkplanService,
    private readonly reoccuringService: PgReoccuringService,
    private readonly exceptionService: PgExceptionService,
    private readonly router: Router,
    private readonly toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.buildForm();
    this.exceptions = [];
    this.reoccurings = [new Reoccuring()];
    this.getAllDataForValidateName();
  }

  private getAllDataForValidateName() {
    forkJoin(
      this.workplanService.get(),
      this.reoccuringService.get(),
      this.exceptionService.get()
    ).subscribe(res => {
      [this.workplanAll, this.reoccuringAll, this.exceptionAll] = res;
    });
  }

  private WorkplanNameValidator = (control: FormControl) => {
    const findItem = this.workplanAll.find(v => v.wp_name === control.value);
    if (findItem) {
      return {duplicatedName: true};
    } else {
      return null;
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      wp_name: ['', [Validators.required, this.WorkplanNameValidator]],
      location: [''],
      country_code: [''],
      description: [''],
      date_start: ['', [Validators.required]],
      date_end: [''],
    });
  }

  public onSubmit() {
    if (this.form.valid) {
      this.workplan = new Workplan(this.form.value, this.reoccurings, this.exceptions);
      this.workplanService.create(this.workplan)
        .subscribe(res => {
          this.toastr.success('New workplan is created successfully!', 'Success!');
          this.router.navigate(['workplans/assigned', {name: this.workplan.wp_name}]);
        }, err => {
          this.toastr.error('This workplan name is already taken', 'Fail');
        });
    }
  }

  public onBack() {
    this.location.back();
  }

  public onAddReoccuring() {
    const reoccuring = new Reoccuring();
    this.reoccurings.push(reoccuring);
  }

  public onRemoveReoccuring(index: number) {
    this.reoccurings.splice(index, 1);
  }

  public onAddException() {
    const exception = new Exception();
    this.exceptions.push(exception);
  }

  public onRemoveException(index: number) {
    this.exceptions.splice(index, 1);
  }

  checkValidForm() {
    let valid = true;
    if (this.exceptions && this.exceptions.length) {
      this.exceptions.forEach(ex => {
        if (!ex.exception_name || !ex.applied_dates) {
          valid = false;
        }
      });
    }
    // check workplan validation
    const validNames = this.reoccurings.reduce((result, e) => result && !!e.reoccuring_name, true);
    const validWorkingDays = this.reoccurings.reduce((result, e) => result && !!e.working_days, true);
    if (this.form && this.form.valid && validNames && validWorkingDays && valid) {
      return true;
    }
  }

  public startDateFilter(date: any) {
    if (!this.form.get('date_end').value || isNaN(this.form.get('date_end').value.getTime())) {
      const now = new Date();
      return moment(date).unix() > moment(now).unix();
    } else {
      const end_date = this.form.get('date_end').value as Date;
      return end_date ? (moment(date).unix() < moment(end_date).unix()) : true;
    }
  }

  public endDateFilter(date: any) {
    if (!this.form.get('date_start').value || isNaN(this.form.get('date_start').value.getTime())) {
      return true;
    } else {
      const begin_date = this.form.get('date_start').value as Date;
      return begin_date ? (moment(date).unix() > moment(begin_date).unix()) : true;
    }
  }

  public onClear() {
    this.form = null;
    window.setTimeout(() => {
      this.ngOnInit();
    }, 100);
  }
}