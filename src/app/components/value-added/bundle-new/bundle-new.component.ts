import * as moment from 'moment';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValueAdded, ValueAddedSchedule } from '../models/value-added.model';
import { UploadService } from '../../../services/upload.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { Bundle } from '../models/bundle.model';
import { PgBundleService } from '../services/bundle.service';
import { BundleService } from '../models/bundle-service.model';
import { PgBundleValueAddedService } from '../services/bundle-value-add.service';
import { forkJoin, Observable } from 'rxjs';
import {CurrentUserService} from '../../../services/current-user.service';

@Component({
  selector: 'app-bundle-new',
  templateUrl: './bundle-new.component.html',
  styleUrls: ['./bundle-new.component.scss']
})

export class BundleNewComponent implements OnInit {
  form: FormGroup;
  service: Bundle = new Bundle();
  schedule: ValueAddedSchedule;
  imgFiles: File[];
  img_url = `${this.apiEndpoint}/`;
  dataSource: MatTableDataSource<ValueAdded>;

  displayedColumns = ['checkbox', 'items', 'amount'];

  selectedServices: BundleService[] = [];
  changedServices: ValueAdded[] = [];

  bundleId: string;
  today = new Date();

  // Permission Feature
  canUpdate = false;
  public options: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly uploadService: UploadService,
    private readonly bundleService: PgBundleService,
    private readonly bundleValueAddedService: PgBundleValueAddedService,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private route: ActivatedRoute,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    private readonly location: Location,
    private currentUserService: CurrentUserService,
  ) {
    this.route.params.subscribe(params => {
      if (params['id'] !== undefined) {
        this.bundleId = params['id'];
      }
    });
   }

  private getValueAdded(id: string) {
    forkJoin(
      this.bundleService.get({id: id}),
      this.bundleValueAddedService.get({bundle_id: id})
    ).subscribe(res => {
      const [bundle, bundle_service] = res;
      this.selectedServices = bundle_service;
      if (bundle.length) {
        this.service = bundle[0];
        this.form.reset({
          bundle_name_en: this.service.bundle_name_en,
          bundle_name_ar: this.service.bundle_name_ar,
          fee: this.service.fee,
          decription: this.service.decription,
          term_conditions: this.service.term_conditions,
          date_start: this.service.date_start,
          date_end: this.service.date_end,
        });
        this.schedule = new ValueAddedSchedule();
        this.schedule.working_days = this.service.working_days;
        this.schedule.timeslot_working = this.service.working_timeslot;
      }
    });
  }

  async ngOnInit() {
    this.options = {
      app: 'web',
      section: 'tariff',
      sub: 'valueadded'
    };

    try {
      const currentUser = await this.currentUserService.get();
      this.canUpdate = !this.bundleId || CurrentUserService.canUpdate(currentUser, 'tariff_valueadded');
      this.buildForm();
      if (this.bundleId) {
        this.getValueAdded(this.bundleId);
      }
    } finally {
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      bundle_name_en: [{value: '', disabled: !this.canUpdate}, [Validators.required]],
      bundle_name_ar: [{value: '', disabled: !this.canUpdate}, [Validators.required]],
      fee: [{value: 1, disabled: !this.canUpdate}, [Validators.required]],
      decription: [{value: '', disabled: !this.canUpdate}, [Validators.required]],
      term_conditions: [{value: '', disabled: !this.canUpdate}, [Validators.required]],
      date_start: [{value: '', disabled: !this.canUpdate}, [Validators.required]],
      date_end: [{value: '', disabled: !this.canUpdate}],
    });

    this.schedule = new ValueAddedSchedule();
  }

  private createService() {
    const value = this.form.value as Bundle;
    this.service.date_created = new Date();
    this.service.date_start = value.date_start;
    this.service.date_end = value.date_end;
    this.service.bundle_name_en = value.bundle_name_en;
    this.service.bundle_name_ar = value.bundle_name_ar;
    this.service.fee = value.fee;
    this.service.decription = value.decription;
    this.service.term_conditions = value.term_conditions;
    this.service.working_days = this.schedule.working_days || '';
    this.service.working_timeslot = this.schedule.timeslot_working || '';
    this.service.img_url = this.service.img_url || '';

    if (this.service.id) {
        let bundle_update_observable = [];
        bundle_update_observable.push(this.bundleService.update(this.service));

        let observable = [];
        observable.push(this.bundleValueAddedService.delete(this.service.id));
        const finalObservable = forkJoin(observable).flatMap( res => {
            let new_obserable = [];

            this.changedServices.forEach( value => {
                let bv = new BundleService();
                bv.date_created = new Date();
                bv.bundle_id = this.service.id;
                bv.service_id = value.id;
                new_obserable.push(this.bundleValueAddedService.create(bv));
            });

            if (new_obserable.length) {
              return forkJoin(new_obserable);
            } else {
              return Observable.of([]);
            }
          });

        bundle_update_observable.push(finalObservable);

        forkJoin(bundle_update_observable).subscribe(res => {
          this.toastr.success('New Bundle is updated successfully!', 'Success!');
          this.router.navigate(['tariff/value-added']);
        }, err => {
          if (err.error) {
            this.toastr.clear();
            this.toastr.error(err.error.error, 'Error!');
          }
        });
    } else {
      this.bundleService.create(this.service).subscribe(res => {
        this.toastr.success('New Bundle is created successfully!', 'Success!');
        const newBundle = res['new'][0] as Bundle;

        if (newBundle) {
          let observable = [];
          this.changedServices.forEach( value => {
            let bs = new BundleService();
            bs.date_created = new Date();
            bs.bundle_id = newBundle.id;
            bs.service_id = value.id;
            observable.push(this.bundleValueAddedService.create(bs));
          });

          if (observable.length) {
            forkJoin(observable).subscribe( res => {
            }, err => {
              if (err.error) {
                this.toastr.clear();
                this.toastr.error(err.error.error, 'Error!');
              }
            });
          }
        }
        this.router.navigate(['tariff/value-added']);
      });
    }
  }

  public onBack() {
    this.location.back();
  }

  public onSubmit() {
    if (this.form.valid) {
      if (this.imgFiles && this.imgFiles.length) {

        this.uploadService.uploadOneByPurpose(this.imgFiles, this.options).subscribe(result => {
          this.service.img_url = result;
          this.createService();
        });
      } else {
        this.createService();
      }
    }
  }

  public onClear() {
    this.form.reset({
      bundle_name_en: '',
      bundle_name_ar: '',
      fee:0,
      decription: '',
      term_conditions: '',
      date_start: '',
      date_end: '',
    });
    this.schedule = new ValueAddedSchedule();
  }

  public onImageAdded(event: any) {
    this.imgFiles = event.currentFiles;

    for (let i = 0; i < this.imgFiles.length; i++) {
      let file = this.imgFiles[i];
      let imgFileType = file.type === 'image/x-icon' || file.type.match('image.*')? true : false;

      if (!imgFileType) {
        this.onRemoveResource(i);
        this.toastr.error('Document file format is invalid.', 'Error');
        return;
      }
    }
  }
  public onRemoveResource(index: number) {
    this.imgFiles.splice(index, 1);
  }

  public onRemoveImage() {
    this.service.img_url = '';
  }

  public onChangedService(event) {
    this.changedServices = event;
  }
  public startDateFilter(date: any) {

    if (!this.form.get('date_end').value) {
      return true;
    } else {
      const end_date = this.form.get('date_end').value as Date;
      return end_date ? (moment(date).unix() < moment(end_date).unix()) : true;
    }
  }

  public endDateFilter(date: any) {

    if (!this.form.get('date_start').value) {
      return true;
    } else {
      const begin_date = this.form.get('date_start').value as Date;
      return begin_date ? (moment(date).unix() > moment(begin_date).unix()) : true;
    }
  }
}