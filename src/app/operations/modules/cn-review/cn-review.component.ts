import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef  } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSelectionList } from '@angular/material/list';
import { MqttService } from 'ngx-mqtt';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { config } from '../../../../config';
import { Contravention } from '../../../shared/classes/contravention';
import { ContraventionService } from '../../../services/contravention.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { CentralDataService } from '../../shared/services/central-data.service';
import { AppConfirmService } from '../../shared/services/app-confirm/app-confirm.service';
import { environment } from '../../../../environments/environment';


@Component({
//  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-cn-review',
  templateUrl: './cn-review.component.html',
  styleUrls: ['./cn-review.component.scss']
})
export class CnReviewComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('statusList') reviewStatusList: MatSelectionList;

  isShowReviewDetail: boolean;
  isShowSearchOption = true;
  baseUrl = environment.baseAssetsUrl;

  isLoading = false;
  selectedCN: Contravention;
  CNs: Contravention[];
  rows = [];

  get cnSearchValues(): any {
    return this.centralDataService.cnSearchValues;
  }
  set cnSearchValues(value: any) {
    this.centralDataService.cnSearchValues = value;
  }

  searchForm: FormGroup;
  searchFormChangeSub: Subscription;

  // Permisssion Feature
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false
  };

  // mqtt live update
  mqttTopics = config.mqttTopics.contravention;

  constructor(
    private readonly contraventionService: ContraventionService,
    private readonly formBuilder: FormBuilder,
    private currentUserService: CurrentUserService,
    private centralDataService: CentralDataService,
    private appConfirmService: AppConfirmService,
    private mqttService: MqttService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    Object.values(this.mqttTopics).forEach(topic => {
      this.mqttService.observe(topic)
        .pipe(takeUntil(this.destroy$))
        .subscribe((message) => this.handleLiveUpdate(topic, message))
      ;
    });
    this.buildForm();
    await this.onSubmit();
    const currentUser = await this.currentUserService.get();
    this.permission = CurrentUserService.canFeature(currentUser, 'enforcement_cn_review');
    // TODO: Fix ExpressionChangedAfterItHasBeenCheckedError
    this.centralDataService.$projects
      .pipe(takeUntil(this.destroy$))
      .subscribe(projects => this.cnSearchValues.projects = projects.filter(element => !!element));
    this.centralDataService.$issuedCountries
      .pipe(takeUntil(this.destroy$))
      .subscribe(plateCountries => this.cnSearchValues.issuedCountries = plateCountries.filter(element => !!element));
    this.centralDataService.$vehiclePlateTypes
      .pipe(takeUntil(this.destroy$))
      .subscribe(plateTypes => this.cnSearchValues.plateTypes = plateTypes.filter(element => !!element));
    this.centralDataService.$violationCodes
      .pipe(takeUntil(this.destroy$))
      .subscribe(violations => this.cnSearchValues.violations = violations.filter(element => !!element));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private buildForm() {
    this.searchForm = this.formBuilder.group({
      project_id: [''],

      start_date: [new Date(), [Validators.required]],
      end_date: [new Date(), [Validators.required]],
      start_time: [''],
      end_time: [''],

      creator_username: [''],
      cn_number: '',
      cn_number_offline: '',
      violation_code: '',
      plate_country: '',
      plate_type: '',
      status_review: '',
    });

    this.searchFormChangeSub = this.searchForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateTable());
  }

  private calcDate() {
    const { start_date, end_date, start_time, end_time } = this.searchForm.value;
    const from = start_date as Date;
    const to = end_date as Date;

    if (start_time) {
      const times = start_time.split(':');
      from.setHours(times[0], times[1], 0, 0);
    } else {
      from.setHours(0, 0, 0, 0);
    }

    if (end_time) {
      const times = end_time.split(':');
      to.setHours(times[0], times[1], 59, 999);
    } else {
      to.setHours(23, 59, 59, 999);
    }
    return { from, to };
  }

  async onSubmit() {
    const {
      project_id, creator_username, cn_number, cn_number_offline,
      violation_code, plate_country, plate_type, status_review,
    } = this.searchForm.value;

    const { from, to } = this.calcDate();
    if (to < from) {
      // TODO: Implement form validator instead
      this.appConfirmService.message({
        type: 'warning',
        title: 'Datetime Range Error',
        message: 'Please double check start datetime and end datetime!'
      });
    } else {
      const params = {
        from: from.toISOString(),
        to: to.toISOString(),
        project_id, creator_username, cn_number, cn_number_offline,
        violation_code, plate_country, status_review,
        plate_type: plate_type ? plate_type.type_name_en : plate_type,
      };

      this.isLoading = true;
      this.CNs = (await this.contraventionService.get(params)).map(cn => new Contravention(cn));
      this.updateTable();
      this.isLoading = false;
    }
  }

  private updateTable() {
    const filter = this.searchForm.value;
    this.rows = this.CNs;
    if (this.rows) {
      this.rows = this.rows.filter(row => {
        let bRet = true;
        const { from, to } = this.calcDate();

        if (filter.project_id) {
          bRet = bRet && row.project_id === filter.project_id;
        }

        if (from && to && !filter.cn_number && !filter.cn_number_offline) {
          bRet = bRet && new Date(row.creation) >= from && new Date(row.creation) <= to;
        }

        if (filter.creator_username) {
          let creator_username = filter.creator_username;
          creator_username = creator_username.trim();
          creator_username = creator_username.toLowerCase();
          bRet = bRet && row.creator_username.toLocaleLowerCase().indexOf(creator_username) >= 0;
        }

        if (filter.violation_code) {
          bRet = bRet && row.violation_code && row.violation_code.indexOf(filter.violation_code) >= 0;
        }

        if (filter.cn_number) {
          let cn_number = filter.cn_number;
          cn_number = cn_number.trim();
          cn_number = cn_number.toLowerCase();
          bRet = bRet && row.cn_number.toLocaleLowerCase().indexOf(cn_number) >= 0;
        }

        if (filter.cn_number_offline) {
          let cn_number_offline = filter.cn_number_offline;
          cn_number_offline = cn_number_offline.trim();
          cn_number_offline = cn_number_offline.toLowerCase();
          bRet = bRet && row.cn_number_offline.toLocaleLowerCase().indexOf(cn_number_offline) >= 0;
        }

        if (filter.plate_country) {
          bRet = bRet && row.plate_country.indexOf(filter.plate_country) >= 0;
        }

        if (filter.plate_type) {
          bRet = bRet && row.plate_type.indexOf(filter.plate_type.type_name_en) >= 0;
        }

        if (filter.status_review && filter.status_review.length) {
          let statusList = [...filter.status_review];
          statusList = statusList.reduce((prevVal, val) => [...prevVal, ...val.split(',')], []);
          bRet = bRet && statusList.includes(row.status_review);
        }

        return bRet;
      });
    }
  }

  updateCN(event: {index: number, newCN: Contravention}) {
    const {index, newCN} = event;
    this.rows[index] = newCN;
    const globalIndex = this.CNs.findIndex(
      (review) => review.cn_number_offline === newCN.cn_number_offline
    );
    this.CNs[globalIndex] = newCN;
  }

  async onSwitchViewMode() {
    if (!this.CNs.length) {
      this.isShowReviewDetail = false;
      return;
    }
    this.isShowReviewDetail = !this.isShowReviewDetail;
    if (!this.isShowReviewDetail) {
      await this.onSubmit();
    }
  }

  public onActivate(event: any) {
    if (event.type === 'click') {
      this.selectedCN = event.row;
      this.isShowReviewDetail = true;
    }
  }

  startDateFilter(d) {
    if (!!this.searchForm.get('end_date').value) {
      return moment(d).unix() <= moment(this.searchForm.get('end_date').value).unix();
    }
    return true;
  }

  endDateFilter(d) {
    if (!!this.searchForm.get('start_date').value) {
      return moment(d).unix() >= moment(this.searchForm.get('start_date').value).unix();
    }
    return true;
  }

  private handleLiveUpdate(topic, message) {
    const jsonMessage = JSON.parse(message.payload.toString());
    console.log('EnforcementReview->handleLiveUpdate', jsonMessage);
    switch (topic) {
      case this.mqttTopics.cancel:
        this.handleContraventionCancel(jsonMessage);
        break;
      case this.mqttTopics.create:
        this.handleContraventionCreate(jsonMessage);
        break;
    }
  }

  private handleContraventionCancel(message) {
    const index = this.CNs.findIndex(contravention => contravention.cn_number_offline === message.cn_number_offline);
    if (index > -1) {
      this.CNs[index] = {...message};
      this.updateTable();
    }
  }

  private handleContraventionCreate(message) {
    const createdAt = new Date(message.creation);
    const {from, to} = this.calcDate();
    if (new Date(from) <= createdAt && new Date(to) >= createdAt) {
      this.CNs.unshift(message);
      this.updateTable();
    }
  }

  ngAfterViewChecked(){
    //your code to update the model
    this.cdr.detectChanges();
  }
}
