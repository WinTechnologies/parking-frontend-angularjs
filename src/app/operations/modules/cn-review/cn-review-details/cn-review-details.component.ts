import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { RaiseChallengeComponent } from '../raise-challenge/raise-challenge.component';
import { Contravention } from '../../../../shared/classes/contravention';
import { Review } from '../../../../shared/classes/review';
import { Challenge } from '../../../../shared/classes/challenge';

import { ReviewService, ValidateResponse, CreateChallengeResponse } from '../../../services/review.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { CentralDataService } from '../../../shared/services/central-data.service';
import { environment } from '../../../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cn-review-details',
  templateUrl: './cn-review-details.component.html',
  styleUrls: ['./cn-review-details.component.scss']
})
export class CnReviewDetailsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() contravention: Contravention;
  @Input() contraventions: Contravention[];
  @Input() permission: any;
  @Output() updateCN = new EventEmitter();

  baseUrl = environment.baseAssetsUrl;
  selectedIndex: number;
  errors = [
    'Wrong photo',
    'Wrong violation type',
    'Wrong plate number',
    'Wrong plate country',
    'Wrong car type',
    'Photo missing',
    'Photo too blurry or too dark',
    'Other'
  ];

  get cnSearchValues(): any {
    return this.centralDataService.cnSearchValues;
  }
  set cnSearchValues(value: any) {
    this.centralDataService.cnSearchValues = value;
  }

  plate_country: string;
  plate_type: string;
  car_plate: string;
  violation_code;
  violation_desc;
  selectedError: string;
  lastModifiedData: any;
  labels = {
    plate_country: 'cn_review.issued',
    plate_type: 'cn_review.type',
    car_plate: 'cn_review.plate',
    violation_code: 'Violation Code',
    violation: 'Violation',
    error: 'Error',
  };
  violation_picture: string[];
  isProcessing = false;

  constructor(
    private dialog: MatDialog,
    private readonly reviewService: ReviewService,
    private readonly notificationService: NotificationService,
    private readonly centralDataService: CentralDataService,
  ) { }

  async ngOnInit() {
    if (!this.contravention && this.contraventions && this.contraventions.length) {
      this.selectedIndex = 0;
    } else {
      this.selectedIndex = this.contraventions.findIndex(v => v.cn_number_offline === this.contravention.cn_number_offline);
    }
    this.contravention = this.contraventions[this.selectedIndex];
    this.setViolationPicture();
    this.centralDataService.$vehiclePlateTypes
      .pipe(takeUntil(this.destroy$))
      .subscribe(plateTypes => {
        this.cnSearchValues.plateTypes = plateTypes.filter(element => !!element);
      });
    this.centralDataService.$issuedCountries
      .pipe(takeUntil(this.destroy$))
      .subscribe(plateCountries => {
        this.cnSearchValues.issuedCountries = plateCountries.filter(element => !!element);
      });
    this.centralDataService.$violationCodes
      .pipe(takeUntil(this.destroy$))
      .subscribe(violations => {
        this.cnSearchValues.violations = violations.filter(element => !!element);
      });

    this.initVariables();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private initVariables() {
    this.plate_country = this.contravention.plate_country;
    this.plate_type = this.contravention.plate_type;
    this.car_plate = this.contravention.car_plate;
    this.selectedError = '';
    if (this.contravention.cn_reviews && this.contravention.cn_reviews.length) {
      const data = this.contravention.cn_reviews[0].data_modification;
      this.lastModifiedData = Object.entries(JSON.parse(data ? data : '{}'));
    } else {
      this.lastModifiedData = [];
    }
    const violation = this.cnSearchValues.violations.find(el => el.violation_name_en === this.contravention.violation);
    this.violation_code = violation.violation_code;
    this.violation_desc = violation.violation_name_en;
  }

  public onPrev() {
    if (this.selectedIndex !== 0) {
      this.selectedIndex = this.selectedIndex - 1;
      this.contravention = this.contraventions[this.selectedIndex];
      this.setViolationPicture();
      this.initVariables();
    }
  }

  public onNext() {
    if (this.selectedIndex !== this.contraventions.length - 1) {
      this.selectedIndex = this.selectedIndex + 1;
      this.contravention = this.contraventions[this.selectedIndex];
      this.setViolationPicture();
      this.initVariables();
    }
  }

  public updateViolationDesc(event) {
    const violation = this.cnSearchValues.violations.find(el => el.violation_code === event.value);
    this.violation_desc = violation.violation_name_en;
  }

  public updateViolationCode(event) {
    const violation = this.cnSearchValues.violations.find(el => el.violation_name_en === event.value);
    this.violation_code = violation.violation_code;
  }

  public isChanged() {
    return (this.plate_country !== this.contravention.plate_country)
      || (this.plate_type !== this.contravention.plate_type)
      || (this.car_plate !== this.contravention.car_plate)
      || (this.violation_desc !== this.contravention.violation);
  }

  private getModifiedData() {
    const data = {};
    if (this.plate_country !== this.contravention.plate_country) {
      data['plate_country'] = {
        original_data: this.contravention.plate_country,
        new_data: this.plate_country,
      };
    }
    if (this.plate_type !== this.contravention.plate_type) {
      data['plate_type'] = {
        original_data: this.contravention.plate_type,
        new_data: this.plate_type,
      };
    }
    if (this.car_plate !== this.contravention.car_plate) {
      data['car_plate'] = {
        original_data: this.contravention.car_plate,
        new_data: this.car_plate,
      };
    }
    if (this.violation_desc !== this.contravention.violation) {
      data['violation_code'] = {
        original_data: this.contravention.violation_code,
        new_data: this.violation_code,
      };
      data['violation'] = {
        original_data: this.contravention.violation,
        new_data: this.violation_desc,
      };
    }
    return JSON.stringify(data);
  }

  async onReviewed() {
    this.isProcessing = true;
    const response: ValidateResponse = await this.reviewService.validate({
      id: this.contravention.cn_number_offline,
      data_modification: this.getModifiedData(),
      error: this.selectedError,
    });

    if (response && response.length >= 2) {
      this.handleAfterProcess(response[0], response[1]);
      this.notificationService.success('cn_review.reviewed_contravention_success', 'common.success');
    }
  }

  public onCreateChallenge() {
    const dialogRef = this.dialog.open(RaiseChallengeComponent, { width: '60%' });
    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(async result => {
      if (result) {
        this.isProcessing = true;
        const response: CreateChallengeResponse = await this.reviewService.challenge({
          id: this.contravention.cn_number_offline,
          challenge_reason: result,
          decision_reason: this.selectedError,
          data_modification: this.getModifiedData(),
          error: this.selectedError,
        });

        if (response && response.length >= 3) {
          this.handleAfterProcess(response[0], response[1], response[2]);
          this.notificationService.success('cn_review.created_challenge_success', 'common.success');
        }
      }
    });
  }

  /**
   * @param response1: Contravention
   * @param response2: Review
   * @param response3: Challenge
   */
  private handleAfterProcess(response1: Contravention, response2: Review, response3: Challenge = null) {
    const data = response2.data_modification;
    this.lastModifiedData = Object.entries(JSON.parse(data ? data : '{}'));

    this.contravention = new Contravention(response1);
    this.contravention.cn_reviews = [response2];

    this.contraventions[this.selectedIndex] = this.contravention;
    this.updateCN.emit({ index: this.selectedIndex, newCN: this.contravention });
    this.isProcessing = false;

    // After Review
    // const newStatus = this.isChanged() ? 'Modified' : 'Validated';
    // setTimeout(() => {
    //   // this.contravention.status_review = newStatus;
    //   this.contraventions[this.selectedIndex] = this.contravention;
    //   this.updateCN.emit({
    //     index: this.selectedIndex, newCN: this.contravention
    //   });
    //   this.isProcessing = false;
    // }, 1000);

    // After Challenge
    // setTimeout(() => {
    //   this.contravention.status_review = 'Challenge requested';
    //   this.contravention.status_challenge = 'Challenge requested';
    //   this.contraventions[this.selectedIndex] = this.contravention;
    //   this.updateCN.emit({
    //     index: this.selectedIndex, newCN: this.contravention
    //   });
    //   this.isProcessing = false;
    // }, 1000);
  }

   setViolationPicture = () => {
    if (this.contravention.violation_picture && typeof this.contravention.violation_picture === 'string') {
        this.violation_picture = this.contravention.violation_picture.split(',');
    }
  }

}
