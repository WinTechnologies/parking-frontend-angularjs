import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValueAdded, ValueAddedSchedule } from '../models/value-added.model';
import { UploadService } from '../../../services/upload.service';
import { PgValueAddedService } from '../services/value-added.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrentUserService } from '../../../services/current-user.service';

@Component({
  selector: 'app-value-added-new',
  templateUrl: './value-added-new.component.html',
  styleUrls: ['./value-added-new.component.scss']
})

export class ValueAddedNewComponent implements OnInit {
  form : FormGroup;
  service: ValueAdded = new ValueAdded();
  schedule: ValueAddedSchedule;
  imgFiles: File[];
  img_url = `${this.apiEndpoint}/`;

  valueAddedId: string;
  today = new Date();

  // Permission Feature
  canUpdate = false;
  public options: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly uploadService: UploadService,
    private readonly valueAddedService: PgValueAddedService,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private route: ActivatedRoute,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    private readonly location: Location,
    private currentUserService: CurrentUserService,
  ) {
    this.route.params.subscribe(params => {
      if (params['id'] !== undefined) {
        this.valueAddedId = params['id'];
      }
    });
  }

  private getValueAdded(id: string) {
    this.valueAddedService.get({id: id}).subscribe(res => {
      if (res.length) {
        this.service = res[0];
        this.form.reset({
          service_name_en: this.service.service_name_en,
          service_name_ar: this.service.service_name_ar,
          fee: this.service.fee,
          decription: this.service.decription,
          term_conditions: this.service.term_conditions,
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
      this.canUpdate = !this.valueAddedId || CurrentUserService.canUpdate(currentUser, 'tariff_valueadded');
      this.buildForm();
      if (this.valueAddedId) {
        this.getValueAdded(this.valueAddedId);
      }
    } finally {
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      service_name_en: [{value: '', disabled: !this.canUpdate}, [Validators.required]],
      service_name_ar: [{value: '', disabled: !this.canUpdate}, [Validators.required]],
      fee: [{value: 0, disabled: !this.canUpdate}, [Validators.required]],
      decription: [{value: '', disabled: !this.canUpdate}, [Validators.required]],
      term_conditions: [{value: '', disabled: !this.canUpdate}, [Validators.required]],
    });

    this.schedule = new ValueAddedSchedule();
  }

  private createService() {
    const value = this.form.value as ValueAdded;
    this.service.date_created = new Date();
    this.service.service_name_en = value.service_name_en;
    this.service.service_name_ar = value.service_name_ar;
    this.service.fee = value.fee;
    this.service.decription = value.decription;
    this.service.term_conditions = value.term_conditions;
    this.service.working_days = this.schedule.working_days || '';
    this.service.working_timeslot = this.schedule.timeslot_working || '';
    if (this.service.id) {
      this.valueAddedService.update(this.service).subscribe(res => {
        this.toastr.success('New Value Added is updated successfully!', 'Success!');
        this.router.navigate(['tariff/value-added']);
      }, err => {
        if (err.error && err.error.message.indexOf('name_en') > -1) {
          const errorMessage = 'Service with the same name (in English) already exists. Please consider changing the name.';
          this.toastr.error(errorMessage, 'Error!');
        } else {
          this.toastr.error(err.error.message, 'Error!');
        }
      });
    } else {
      this.valueAddedService.create(this.service).subscribe(res => {
        this.toastr.success('New Value Added is created successfully!', 'Success!');
        this.router.navigate(['tariff/value-added']);
      }, err => {
        if (err.error && err.error.message.indexOf('name_en') > -1) {
          const errorMessage = 'Service with the same name (in English) already exists. Please consider changing the name.';
          this.toastr.error(errorMessage, 'Error!');
        } else {
          this.toastr.error(err.error.message, 'Error!');
        }
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
      service_name_en: '',
      service_name_ar: '',
      fee:0,
      decription: '',
      term_conditions: '',
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
    this.service.img_url = null;
  }
}