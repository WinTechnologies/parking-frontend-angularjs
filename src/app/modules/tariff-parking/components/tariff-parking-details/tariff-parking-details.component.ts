import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectZone } from '../../../project-setup/common-setup/models/onstreet/project_zone.model';
import { TariffSegment } from '../../models/tariff-segment.model';
import { PgProjectsService } from '../../../../components/projects/services/projects.service';
import { PgProjectZoneService } from '../../../project-setup/common-setup/services/onstreet/project-zone.service';
import { Project } from '../../../../components/projects/models/project.model';
import { TariffSegmentService } from '../../services/tariff-segment.service';
import { TariffIntervalService } from '../../services/tariff-interval.service';
import * as moment from 'moment';
import { TariffInterval } from '../../models/tariff-interval.model';
import { ToastrService } from 'ngx-toastr';
import { config } from '../../../../../config';
import { ParkingPriceTypes, ParkingStreetType, ParkingTimeType, tariffParkingConfig } from '../../tariff-parking.const';
import { LoaderService } from '../../../../services/loader.service';
import { Location } from '@angular/common';
import { TariffParkingBasicService } from '../../services/tariff-parking-basic.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tariff-parking-details',
  templateUrl: './tariff-parking-details.component.html',
  styleUrls: ['./tariff-parking-details.component.scss']
})
export class TariffParkingDetailsComponent implements OnInit {

  project_id: number;
  segment: TariffSegment = new TariffSegment();
  form: FormGroup;

  ParkingPriceTypes = ParkingPriceTypes;
  ParkingTimeType = ParkingTimeType;
  clientTypes = tariffParkingConfig.clientTypes;
  priceTypes = tariffParkingConfig.priceTypes;
  weekdaynames = config.weekdaynames;
  timeSteps = config.tariffParking.timeSteps;
  extraDaytimeStep = {text: '1d', value: 1440};

  segments: TariffSegment[] = [];
  intervals: TariffInterval[];
  intervalTimeSteps = [];
  zones: ProjectZone[] = [];
  projects: Project[];

  timeType = ParkingTimeType.TOD;
  formStatus = {
    isCompletedTimeSegment: false,
    formSubmitted: false,
    formInProgress: false,
    valueAsString: '',
    addedExtraDay: false
  };

  errorSegments = [];
  timeUnits = {
    TOD: [],
    GTS: []
  };
  enabledExtraDayTariff: boolean;

  enabledTimeInterval: boolean;
  timeLineColor = '#2196f3';
  timeSlots = [];
  today = new Date();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly projectService: PgProjectsService,
    private readonly zoneService: PgProjectZoneService,
    private readonly tariffSegmentService: TariffSegmentService,
    private readonly toastr: ToastrService,
    private readonly tariffIntervalService: TariffIntervalService,
    private readonly loaderService: LoaderService,
    public location: Location,
    private tariffParkingBasicService: TariffParkingBasicService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.activatedRoute.params
      .subscribe((params: Params) => {
        if (params['id']) {
          this.segment.id = +params['id'];
          this.getSegment();
        }
      });

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .subscribe(paramMap => {
        if (paramMap.hasOwnProperty('type_client')) {
          this.segment = {...paramMap} as TariffSegment;
          this.buildForm();
        }
      });

    if (!this.segment.id && !this.segment.type_client) {
      this.buildForm();
    }
  }

  private async getSegment() {
    try {
      this.loaderService.enable();
      const segments = await this.tariffSegmentService.get({id: this.segment.id});
      this.segment = segments[0];
      this.buildForm();
    } finally {
      this.loaderService.disable();
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      project_id: [this.segment.project_id ? this.segment.project_id : null, Validators.required],
      zone_id: [this.segment.zone_id ? this.segment.zone_id : null, Validators.required],
      street_type: [this.segment.is_onstreet ? ParkingStreetType.OnStreet : ParkingStreetType.Carpark, Validators.required],
      parking_id: [this.segment.parking_id ? this.segment.parking_id : null, Validators.required],
      carpark_id: [this.segment.carpark_id ? this.segment.carpark_id : null, Validators.required],
      carpark_zone_id: [this.segment.carpark_zone_id ? this.segment.carpark_zone_id : null, Validators.required],
      segment_name: [this.segment.segment_name, [Validators.required, this.nameValidator.bind(this)]],
      type_client: [this.segment.type_client ? this.segment.type_client : this.clientTypes[0], Validators.required],
      date_start: [this.segment.date_start ? new Date(this.segment.date_start) : null, Validators.required],
      date_end: [this.segment.date_end ? new Date(this.segment.date_end) : null, Validators.required],
      applicable_days: [this.segment.applicable_days ? this.segment.applicable_days : '', Validators.required],
      type_tariff: [this.segment.type_tariff ? this.segment.type_tariff : ParkingPriceTypes.Absolute, Validators.required],
      time_start: [this.segment.time_start ? this.segment.time_start : null, Validators.required],
      time_end: [this.segment.time_end ? this.segment.time_end : null, Validators.required],
      breaks: this.formBuilder.array([])
    }, {
      validator: this.timeRangeValidator.bind(this)
    });

    if (this.isWholeDay()) {
      this.onCheckWholeDay({checked: true});
    } else {
      this.onAddTimeSlot();
    }

    if (this.segment.intervals) {
      if (this.segment.type_tariff === ParkingPriceTypes.Custom) {
        this.timeType = this.segment.time_handling as ParkingTimeType;
        this.form.removeControl('price_init');
        this.form.removeControl('time_step');
        this.form.removeControl('price_per_time_step');
        this.form.removeControl('rate_growth');
        this.form.removeControl('description');

        if (!this.form.get('time_step')) {
          this.form.addControl('time_step', new FormControl({value: 30, disabled: true}, Validators.required));
        }
        while (this.breaks.length !== 0) {
          this.breaks.removeAt(0);
        }
        this.makeSubTimeSteps();

       this.segment.intervals.forEach( interval => {
          const formGroup = this.formBuilder.group(
            {
              time_start: [{value: interval.time_start, disabled: true}, Validators.required],
              type_tariff: [{value: interval.type_tariff, disabled: true}, Validators.required],
              time_end: [{value: interval.time_end, disabled: true}, Validators.required],
              description: [{value: interval.description, disabled: true}]
            }
          );
          switch (interval.type_tariff) {
            case ParkingPriceTypes.Absolute:
              formGroup.addControl('price_init', new FormControl({value: interval.price_init, disabled: true}, Validators.required));
              break;
            case ParkingPriceTypes.FixedRate:
              formGroup.addControl('price_init', new FormControl({value: interval.price_init, disabled: true}, Validators.required));
              formGroup.addControl('time_step', new FormControl({value: interval.time_step, disabled: true}, Validators.required));
              formGroup.addControl('price_per_time_step', new FormControl({value: interval.price, disabled: true}, Validators.required));
              break;
            case ParkingPriceTypes.Ladder:
              formGroup.addControl('price_init', new FormControl({value: interval.price_init, disabled: true}, Validators.required));
              formGroup.addControl('time_step', new FormControl({value: interval.time_step, disabled: true}, Validators.required));
              formGroup.addControl('rate_growth', new FormControl({value: interval.rate_growth, disabled: true}, Validators.required));
              break;
          }
          this.breaks.push(formGroup);
        });

      } else {
        this.changePriceType({value: this.segment.type_tariff});
      }
    } else {
      this.changePriceType({value: ParkingPriceTypes.Absolute});
    }
  }

  private nameValidator(control: AbstractControl) {
    const name = control.value;
    if (name && this.segments && this.segments.length) {
      const findSegment = this.segments.find(segment => {
        return segment.segment_name === name && (segment.id !== this.segment.id);
      });
      if (findSegment) {
        return { invalidName: true };
      }
    }
    return null;
  }

  private timeRangeValidator(form: FormGroup) {
    if (!form.get('date_start').value || !form.get('date_start').value
      || !form.get('time_start').value || !form.get('time_end').value) {
      return null;
    }

    const date_start = moment(form.get('date_start').value, 'YYYY-MM-DD');
    const date_end = moment(form.get('date_end').value, 'YYYY-MM-DD');
    const time_start = moment(form.get('time_start').value, 'HH:mm');
    const time_end = moment(form.get('time_end').value, 'HH:mm');
    const applicable_days = form.get('applicable_days').value;

    const findSegments = this.segments.filter(segment => {
      if (this.segment.id !== segment.id) {
        const sDateTime = this.convertSegmentDateTime(segment);
        if (this.checkInValidDay(date_start, sDateTime) || this.checkInValidDay(date_end, sDateTime)) {
          if (this.checkInvalidApplicableDays(applicable_days, segment.applicable_days)) {
            if (this.checkInValidTimes({time_start, time_end}, sDateTime)) {
              return true;
            }
          }
        }
      }
      return false;
    });

    if (findSegments.length) {
      this.errorSegments = [...findSegments];
      return { timeRangeError: true};
    }

    return null;
  }

  private convertSegmentDateTime(segment: TariffSegment) {
    const date_start = moment(segment.date_start, 'YYYY-MM-DD');
    const date_end = moment(segment.date_end, 'YYYY-MM-DD');
    const time_start = moment(segment.time_start, 'HH:mm');
    const time_end = moment(segment.time_end, 'HH:mm');
    return {date_start, date_end, time_start, time_end};
  }

  private checkInValidDay(current, duration) {
    return !current.isBefore(duration.date_start) && !current.isAfter(duration.date_end);
  }

  private checkInvalidApplicableDays(aDays, bDays) {
    const aDaysArray = aDays.split(',');
    const bDaysArray = bDays.split(',');
    return aDaysArray.some(item => bDaysArray.includes(item));
  }

  private checkInValidTimes(current, duration) {
    if (current.time_start.isAfter(current.time_end)) {
      current.time_end.add(24, 'hours');
    }
    if (duration.time_start.isAfter(duration.time_end)) {
      duration.time_end.add(24, 'hours');
    }
    return current.time_start.isBetween(duration.time_start, duration.time_end)
      || current.time_end.isBetween(duration.time_start, duration.time_end)
      || (!current.time_start.isAfter(duration.time_start) && !current.time_end.isBefore(duration.time_end));
  }

  public get breaks(): FormArray {
    return this.form.get('breaks') as FormArray;
  }

  public checkLastTimeStep(index) {
    const timeUnits = this.timeUnits[this.timeType];
    return this.breaks.at(index).get('time_end').value === timeUnits[timeUnits.length - 1];
  }

  public onAddIntervalForm(form?: FormGroup, extraDay = false) {
    const breaksLength = this.breaks.controls.length;
    if (breaksLength > 0) {
      this.form.get('time_step').disable();
    }

    if (form !== undefined) {
      // disable current sub segment form
      Object.keys(form.controls).forEach( key => {
        form.get(key).disable();
      });
    }

    const timeUnits = this.timeUnits[this.timeType];
    const time_start = breaksLength === 0 ? timeUnits[0] : this.breaks.at(breaksLength - 1).get('time_end').value;
    const time_end = !extraDay ? timeUnits[timeUnits.indexOf(time_start) + 1] : null;

    let formGroup: FormGroup;
    if (!extraDay) {
      formGroup = this.formBuilder.group(
        {
          time_start: [{value: time_start, disabled: true}, Validators.required],
          type_tariff: [ParkingPriceTypes.Absolute, Validators.required],
          time_end: [time_end, Validators.required],
          description: [null]
        }
      );
    } else {
      this.formStatus.addedExtraDay = extraDay;
      this.intervalTimeSteps.push(this.extraDaytimeStep);
      formGroup = this.formBuilder.group(
        {
          time_start: [{value: time_start, disabled: true}, Validators.required],
          type_tariff: [ParkingPriceTypes.Absolute, Validators.required],
          time_end: [{value: time_end, disabled: true}],
          description: [null]
        }
      );
    }

    this.changePriceType({value: ParkingPriceTypes.Absolute}, formGroup);
    this.breaks.push(formGroup);
  }

  public getTimeUnits(subForm?: FormGroup) {
    const time_start = subForm.get('time_start').value;
    return this.timeUnits[this.timeType].slice(this.timeUnits[this.timeType].indexOf(time_start) + 1);
  }

  public onRemoveSegment(breakIndex: number) {
    this.breaks.removeAt(breakIndex);
    if (this.formStatus.addedExtraDay) {
      this.formStatus.addedExtraDay = false;
      this.intervalTimeSteps.pop();
    }

    if (breakIndex === 1) {
      this.form.get('time_step').enable();
    }

    const form = this.breaks.at(this.breaks.length - 1) as FormGroup;
    if (form !== undefined) {
      // enable current sub segment form
      Object.keys(form.controls).forEach( key => {
        form.get(key).enable();
      });
    }
  }

  public onChangedWeekdays(event: any) {
    this.form.patchValue({applicable_days: event.weekdays });
    this.form.updateValueAndValidity();
  }

  private makeSubTimeSteps() {
    this.timeUnits.TOD = [];
    this.timeUnits.GTS = [];
    if (this.form.get('time_start').value && this.form.get('time_end').value && this.form.get('time_step').value) {
      const step = this.form.get('time_step').value;
      this.intervalTimeSteps = this.timeSteps.slice(0);

      const startTime = moment(this.form.get('time_start').value, 'HH:mm');
      const endTime = moment(this.form.get('time_end').value, 'HH:mm');
      const startTimeForGTS = moment('00:00', 'HH:mm');

      let totalTimesInMinutes = endTime.diff(startTime, 'minutes');
      totalTimesInMinutes = totalTimesInMinutes <= 0 ? 60 * 24 - (-totalTimesInMinutes) : totalTimesInMinutes;
      const lastIndex = Math.ceil(totalTimesInMinutes / step);
      const isCeil = lastIndex > (totalTimesInMinutes / step);

      this.timeUnits.TOD.push(startTime.format('HH:mm'));
      this.timeUnits.GTS.push(startTimeForGTS.format('HH:mm'));
      for ( let stepIndex = 1; stepIndex <= lastIndex; stepIndex++) {
        const timeTOD = isCeil && stepIndex === lastIndex ? endTime : startTime.add(step, 'minutes');
        const diffGTS = isCeil && stepIndex === lastIndex ? endTime.diff(startTime, 'minutes') : step;
        this.timeUnits.TOD.push(timeTOD.format('HH:mm'));
        if (startTimeForGTS.add(diffGTS, 'minutes').isSame(moment('24:00', 'HH:mm'))) {
          this.timeUnits.GTS.push('24:00');
        } else {
          this.timeUnits.GTS.push(startTimeForGTS.format('HH:mm'));
        }
      }
    }
  }

  public changeTimeStep(event: any) {
    if (this.form.get('type_tariff').value === ParkingPriceTypes.Custom) {
      this.makeSubTimeSteps();
      // update time_end of the first interval.
      this.breaks.at(0).get('time_end').setValue(this.timeUnits[this.timeType][1]);
    }
  }

  public changePriceType(event: any, g?: any) {
    const type = event.value;
    const form = g ? g : this.form;

    if (type !== ParkingPriceTypes.Custom) {
      if (!form.get('price_init')) {
        form.addControl('price_init', new FormControl(!g && this.segment.intervals ? this.segment.intervals[0].price_init : 0, Validators.required));
      }
      if (!form.get('description')) {
        form.addControl('description', new FormControl(!g && this.segment.intervals ? this.segment.intervals[0].description : ''));
      }
    } else {
      form.removeControl('price_init');
      form.removeControl('description');
    }

    if (type === ParkingPriceTypes.FixedRate || type === ParkingPriceTypes.Ladder) {
      if (!form.get('time_step')) {
        form.addControl('time_step', new FormControl(!g && this.segment.intervals ? this.segment.intervals[0].time_step : 30, Validators.required));
      }

      if (!form.get('price_per_time_step')) {
        form.addControl('price_per_time_step', new FormControl(!g && this.segment.intervals ? this.segment.intervals[0].price : 0, Validators.required));
      }

      if (type === ParkingPriceTypes.Ladder) {
        if (!form.get('rate_growth')) {
          form.addControl('rate_growth', new FormControl(!g && this.segment.intervals ? this.segment.intervals[0].rate_growth : 0, Validators.required));
        }
      } else {
        form.removeControl('rate_growth');
      }
    } else {
      form.removeControl('time_step');
      form.removeControl('price_per_time_step');
      form.removeControl('rate_growth');
    }

    if (!g) {
      if (type === ParkingPriceTypes.Custom) {
        // if (!this.checkCustomTypeEnable()) {
        //   return;
        // }
        if (!form.get('time_step')) {
          form.addControl('time_step', new FormControl(30, Validators.required));
        }
        while (this.breaks.length !== 0) {
          this.breaks.removeAt(0);
        }
        this.makeSubTimeSteps();
        this.onAddIntervalForm();
      }
    }
  }

  public changeTimeType(type: ParkingTimeType) {
    this.timeType = type;
    // remove all sub form
    while (this.breaks.length !== 0) {
      this.breaks.removeAt(0);
    }

    this.form.get('time_step').enable();
    this.enabledExtraDayTariff = type === ParkingTimeType.GTS && this.isWholeDay();
    this.onAddIntervalForm();
  }

  private isCompletedTimeSegment() {
    return this.formStatus.addedExtraDay || this.checkLastTimeStep(this.breaks.controls.length - 1);
  }

  private isFormValid() {
    if (this.form.get('type_tariff').value === ParkingPriceTypes.Custom) {
      this.formStatus.isCompletedTimeSegment = this.isCompletedTimeSegment();
    } else {
      this.formStatus.isCompletedTimeSegment = true;
    }
    return this.formStatus.isCompletedTimeSegment && this.form.valid;
  }

  private reloadForm() {
    this.segment = new TariffSegment();
    this.form = null;
    window.setTimeout(() => {this.buildForm(); }, 100);
  }

  private makeSegment(formValue: any): TariffSegment {
    const segment = new TariffSegment();
    if (this.segment.id) {
      segment.id = this.segment.id;
    }
    segment.segment_name = formValue.segment_name;
    segment.type_client = formValue.type_client;
    segment.is_onstreet = formValue.street_type === ParkingStreetType.OnStreet;
    segment.is_carpark = formValue.street_type === ParkingStreetType.Carpark;
    segment.project_id = formValue.project_id;
    segment.zone_id = formValue.zone_id;
    segment.parking_id = formValue.parking_id;
    segment.carpark_id = formValue.carpark_id;
    segment.carpark_zone_id = formValue.carpark_zone_id;

    segment.date_start = moment(formValue.date_start).format('YYYY-MM-DD');
    segment.date_end = moment(formValue.date_end).format('YYYY-MM-DD');
    segment.time_start = formValue.time_start;
    segment.time_end = formValue.time_end;
    segment.applicable_days = formValue.applicable_days;
    segment.type_tariff = formValue.type_tariff;

    switch (formValue.type_tariff) {
      case ParkingPriceTypes.Absolute:
        // segment.time_handling = ParkingTimeType.TOD;
        // segment.price_max = formValue.price;
        break;
      case ParkingPriceTypes.FixedRate:
        // segment.time_handling = ParkingTimeType.TOD;
        // segment.price_max = formValue.init_price + (Math.ceil(this.totalTimesInMinutes / formValue.time_step ) - 1) * formValue.price_per_time_step;
        break;
      case ParkingPriceTypes.Ladder:
        // segment.time_handling = ParkingTimeType.TOD;
        // const step = Math.ceil(this.totalTimesInMinutes / formValue.time_step );
        // segment.price_max = formValue.init_price * Math.pow(formValue.growth_factor, step);
        break;
      case ParkingPriceTypes.Custom:
        segment.time_handling = this.timeType;
        segment.time_step_custom = formValue.time_step;
        // segment.price_max = 0;
        break;
    }
    segment.intervals = this.makeIntervals(formValue);

    return segment;
  }

  private makeIntervals(formValue: any): TariffInterval[] {
    if (formValue.type_tariff !== ParkingPriceTypes.Custom) {
      const interval = new TariffInterval();
      interval.type_tariff = formValue.type_tariff;
      interval.description = formValue.description;
      interval.time_start = formValue.time_start;
      interval.time_end = formValue.time_end;
      switch (formValue.type_tariff) {
        case ParkingPriceTypes.Absolute:
          interval.time_step = 0;
          interval.price = formValue.price_init;
          interval.price_init = formValue.price_init;
          interval.rate_growth = 0;
          break;
        case ParkingPriceTypes.FixedRate:
          interval.time_step = formValue.time_step;
          interval.price = formValue.price_per_time_step;
          interval.price_init = formValue.price_init;
          interval.rate_growth = 0;
          break;
        case ParkingPriceTypes.Ladder:
          interval.time_step = formValue.time_step;
          interval.price = formValue.price_per_time_step;
          interval.price_init = formValue.price_init;
          interval.rate_growth = formValue.rate_growth;
          break;
      }
      return [interval];
    } else {
      const intervals = [];

      this.breaks.controls.forEach(g => {
        const value = (g as FormGroup).getRawValue();
        const interval = new TariffInterval();
        interval.time_step = value.time_step ? value.time_step : 0;
        interval.time_start = value.time_start;
        interval.time_end = value.time_end;
        interval.price = value.price_type !== ParkingPriceTypes.Absolute ?  value.price_per_time_step : value.price ? value.price : 0;
        interval.price_init = value.price_init ? value.price_init : 0;
        interval.rate_growth = value.rate_growth ? value.rate_growth : 0;
        interval.type_tariff = value.type_tariff;
        interval.description = value.description;
        intervals.push(interval);
      });
      return intervals;
    }
  }

  public async onSubmit() {
    this.formStatus.formSubmitted = true;

    if (this.isFormValid()) {
      try {
        this.loaderService.enable();
        const segment = this.makeSegment(this.form.getRawValue());
        if (!this.segment.id) {
          await this.tariffSegmentService.create(segment);
          this.toastr.success('New tariff segment is created successfully!', 'Success!');
        } else {
          await this.tariffSegmentService.update(segment);
          this.toastr.success('The tariff segment is updated successfully!', 'Success!');
        }
        this.router.navigate(['/tariff/parking']);
      } catch (e) {
        this.toastr.error(e.error && e.error.message ? e.error.message : 'Something went wrong!', 'Error');
      } finally {
        this.loaderService.disable();
      }
    }
  }

  public onCancel() {
    this.location.back();
  }

  public getTariffType( g: FormGroup) {
    if (g && g.get('type_tariff')) {
      return g.get('type_tariff').value;
    }
    return '';
  }

  public isWholeDay() {
    return this.form.get('time_start').value && this.form.get('time_start').value === this.form.get('time_end').value;
  }

  public onCheckWholeDay(event) {
    if (event.checked) {
      if (this.form.get('time_start').value) {
        this.form.get('time_end').setValue(this.form.get('time_start').value);
      } else {
        this.form.patchValue({time_start: '00:00', time_end: '00:00'});
      }
      this.onAddTimeSlot();
    } else {
      this.onClearTimeSlot();
    }
  }

  public onChangeTime(event) {
    if (this.isWholeDay()) {
      this.onAddTimeSlot();
    }
  }

  public onAddTimeSlot() {
    if (this.form.get('time_start').value && this.form.get('time_end').value) {
      if (!this.isWholeDay()) {
      this.timeSlots = [`${this.form.get('time_start').value}-${this.form.get('time_end').value}`];
      }
      this.form.get('time_start').disable();
      this.form.get('time_end').disable();
      this.enabledTimeInterval = true;
    }
  }

  public onClearTimeSlot() {
    this.form.patchValue({time_start: null, time_end: null});
    this.form.get('time_start').enable();
    this.form.get('time_end').enable();
    this.enabledTimeInterval = false;
    this.timeSlots = [];

    while (this.breaks.length !== 0) {
      this.breaks.removeAt(0);
    }
  }

  onSelectSegment(segment) {
    if (segment.id) {
      this.router.navigate(['/tariff/parking/details', segment.id]);
    } else {
      this.router.navigate(['/tariff/parking/details/new'], { state: this.segment });
    }
  }

  async onUpdateBasicData(segment) {
    if (!!segment
      && (segment.street_type === ParkingStreetType.OnStreet && segment.parking_id
        || segment.street_type === ParkingStreetType.Carpark && segment.carpark_zone_id)
    ) {
      try {
        this.loaderService.enable();
        const params = this.makeFilterParams(segment);
        this.segments = await this.tariffSegmentService.get(params);
      } finally {
        this.loaderService.disable();
      }
    } else {
      this.segments = [];
    }
  }

  private makeFilterParams(segment) {
    let params: any = {
      type_client: segment.type_client,
      is_onstreet: segment.street_type === ParkingStreetType.OnStreet
    };

    if (params.is_onstreet) {
      params = {...params, parking_id: segment.parking_id};
    } else {
      params = {...params, carpark_zone_id: segment.carpark_zone_id};
    }
    return params;
  }

  public checkAddInterval(index) {
    return (!this.enabledExtraDayTariff && !this.checkLastTimeStep(index))
      || (this.enabledExtraDayTariff && !this.formStatus.addedExtraDay && !this.checkLastTimeStep(index));
  }

  public checkAddExtraDayInterval(index) {
    return this.enabledExtraDayTariff && !this.formStatus.addedExtraDay && this.checkLastTimeStep(index);
  }
}
