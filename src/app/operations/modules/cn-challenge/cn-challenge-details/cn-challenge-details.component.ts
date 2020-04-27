import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ChallengeService } from '../../../services/challenge.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { Violation } from '../../../interfaces/violation.interface';
import { CentralDataService } from '../../../shared/services/central-data.service';
import { ChallengedCN } from '../../../../shared/classes/contravention';

@Component({
  selector: 'app-cn-challenge-details',
  templateUrl: './cn-challenge-details.component.html',
  styleUrls: ['./cn-challenge-details.component.scss']
})
export class CnChallengeDetailsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() challenge: ChallengedCN;
  @Input() challenges: ChallengedCN[];
  @Input() permission: any;

  baseUrl = environment.baseAssetsUrl;
  selectedIndex: number;
  isProcessing = false;
  lastModifiedData: any;
  decisionReason: string;
  violations: Violation[] = [];
  violation_code = '';
  violation_desc = '';
  labels = {
    plate_country: 'cn_review.issued',
    plate_type: 'cn_review.type',
    car_plate: 'cn_review.plate',
    violation_code: 'Violation Code',
    violation: 'Violation',
    error: 'Error',
  };
  violation_picture: string[];
  constructor(
    private dialog: MatDialog,
    private readonly challengeService: ChallengeService,
    private readonly notificationService: NotificationService,
    private readonly appConfirmService: AppConfirmService,
    private readonly centralDataService: CentralDataService,
  ) { }

  async ngOnInit() {
    if (!this.challenge && this.challenges && this.challenges.length) {
      this.selectedIndex = 0;
    } else {
      this.selectedIndex = this.challenges.findIndex(v => v.challenge_id === this.challenge.challenge_id);
    }
    this.challenge = this.challenges[this.selectedIndex];
    this.setViolationPicture();
    this.centralDataService.$violationCodes
      .pipe(takeUntil(this.destroy$))
      .subscribe(violations => {
        this.violations = violations;
        this.initModifiedData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private initModifiedData() {
    this.decisionReason = this.challenge.decision_reason;
    if (this.challenge.data_modification) {
      const data = this.challenge.data_modification;
      this.lastModifiedData = Object.entries(JSON.parse(data ? data : '{}'));
    } else {
      this.lastModifiedData = [];
    }

    const violation = this.violations.find(el => el.violation_name_en === this.challenge.violation);
    this.violation_code = violation.violation_code;
    this.violation_desc = violation.violation_name_en;
  }

  public onPrev() {
    if (this.selectedIndex !== 0) {
      this.selectedIndex = this.selectedIndex - 1;
      this.challenge = this.challenges[this.selectedIndex];
      this.setViolationPicture();
      this.initModifiedData();
    }
  }

  public onNext() {
    if (this.selectedIndex !== this.challenges.length - 1) {
      this.selectedIndex = this.selectedIndex + 1;
      this.challenge = this.challenges[this.selectedIndex];
      this.setViolationPicture();
      this.initModifiedData();
    }
  }

  onReject() {
    this.appConfirmService.confirm({
      title: 'cn_review.decision',
      message: 'cn_review.reject_confirm',
      canInput: true,
      placeholder: 'cn_review.reason',
    }).pipe(takeUntil(this.destroy$))
      .subscribe(async ({result, input}) => {
      if (result) {
        this.isProcessing = true;
        this.decisionReason = input;
        await this.challengeService.reject({
          id: this.challenge.challenge_id,
          review_id: this.challenge.review_id,
          decision_reason: input,
          contravention: this.challenge.cn_number_offline,
        });

        setTimeout(() => {
          this.challenge.status_challenge = 'Challenge rejected';
          this.challenge.status = '1';
          this.isProcessing = false;
        }, 1000);

        this.notificationService.success('cn_review.rejected_challenge_success', 'common.success');
      }
    });
  }

  async onCancel() {
    this.appConfirmService.confirm({
      title: 'cn_review.decision',
      message: 'cn_review.cancel_confirm',
      canInput: true,
      placeholder: 'cn_review.reason',
    }).pipe(takeUntil(this.destroy$))
      .subscribe(async ({result, input}) => {
      if (result) {
        this.isProcessing = true;
        this.decisionReason = input;
        await this.challengeService.validate({
          id: this.challenge.challenge_id,
          review_id: this.challenge.review_id,
          decision_reason: input,
          contravention: this.challenge.cn_number_offline,
        });

        setTimeout(() => {
          this.challenge.status_challenge = 'Contravention cancelled';
          this.challenge.status = '4';
          this.isProcessing = false;
        }, 1000);

        this.notificationService.success('cn_review.cancel_challenge_success', 'common.success');
      }
    });
  }

  setViolationPicture = () => {
    if (this.challenge.violation_picture && typeof this.challenge.violation_picture === 'string') {
        this.violation_picture = this.challenge.violation_picture.split(',');
    }
  }
}
