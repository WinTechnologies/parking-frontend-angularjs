import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {CurrentUserService} from '../../../../../services/current-user.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {LoaderService} from '../../../../../services/loader.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Promotion} from '../../../models/promotion.model';
import {PromotionService} from '../../../services/promotion.service';
import {ToastrService} from 'ngx-toastr';
import {PromotionValidation} from '../../../models/shared.model';

@Component({
  selector: 'app-promotion-detail',
  templateUrl: './promotion-detail.component.html',
  styleUrls: ['./promotion-detail.component.scss']
})
export class PromotionDetailComponent implements OnInit {

  promotionId: number;
  promotion: Promotion;
  promotionForm: FormGroup;

  promotionValidation: PromotionValidation = new PromotionValidation();

  today = new Date();

  // Permission Feature
  canUpdate = false;

  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private currentUserService: CurrentUserService,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
    private promotionService: PromotionService,
    private toastrService: ToastrService,
    private router: Router,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.promotionId = +params['id'];
    });
  }

  async ngOnInit() {

    try {
      this.loaderService.enable();

      if (this.promotionId) {
        const promises = [
          this.currentUserService.get(),
          this.promotionService.getPromotion(this.promotionId)
        ];
        const [currentUser, promotion] = await Promise.all(promises);
        this.canUpdate = !this.checkExpired(promotion) && CurrentUserService.canUpdate(currentUser, 'tariff_promotion');
        promotion.selectedParkings = promotion.promotionParkings.map(promotionParking => promotionParking.parking_id);
        this.promotion = {...promotion};
      } else {
        this.canUpdate = true;
        this.promotion = new Promotion();
      }
      this.buildForm();
    } finally {
      this.loaderService.disable();
    }
  }

  private buildForm() {
    this.promotionForm = this.formBuilder.group({
      promo_code: [{value: this.promotion.promo_code, disabled: !!this.promotionId}, [Validators.required]],
      promo_name_en: [{value: this.promotion.promo_name_en, disabled: !this.canUpdate}, [Validators.required]],
      promo_name_ar: [{value: this.promotion.promo_name_ar, disabled: !this.canUpdate}, [Validators.required]],
      activity: [{value: this.promotion.activity, disabled: !this.canUpdate}, [Validators.required]],
      discount_value: [{value: this.promotion.discount_value, disabled: !this.canUpdate}, [Validators.required, Validators.min(0)]],
      discount_percetage: [{value: this.promotion.discount_percetage, disabled: !this.canUpdate}, [Validators.required, Validators.min(0)]],
      credit_value: [{value: this.promotion.credit_value, disabled: !this.canUpdate}, [Validators.required, Validators.min(0)]],
      min_spending: [{value: this.promotion.min_spending, disabled: !this.canUpdate}, [Validators.required, Validators.min(0)]],
      nbr_instances: [{value: this.promotion.nbr_instances, disabled: !this.canUpdate}, [Validators.required, Validators.min(-1)]],
      unlimited: [{value: this.promotion.nbr_instances === -1, disabled: !this.canUpdate}],
      nbr_instances_per_user: [{value: this.promotion.nbr_instances_per_user, disabled: true}],
      date_start: [{value: this.promotion.date_start, disabled: !this.canUpdate}, [Validators.required]],
      date_end: [{value: this.promotion.date_end, disabled: !this.canUpdate}],
      term_conditions: [{value: this.promotion.term_conditions, disabled: !this.canUpdate}],
    });
  }

  checkValidForm() {
    return this.promotionForm.valid && this.promotion.selectedParkings.length > 0;
  }

  public inputCheck(event: any) {
    const pattern = /[a-zA-Z0-9\/\ ]/;
    const inputChar = event.keyCode ? String.fromCharCode(event.keyCode) : (event.clipboardData).getData('text');
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  async onSubmit() {
    if (!this.checkValidForm()) {
      return false;
    }
    const promotion = {...this.promotion, ...this.promotionForm.value};
    delete promotion.unlimited;
    delete promotion.promotionParkings;

    try {
      this.loaderService.enable();
      if (this.promotionId) {
        await this.promotionService.updatePromotion(promotion);
        this.toastrService.success('The promotion is updated successfully!', 'Success!');
      } else {
        await this.promotionService.createPromotion(promotion);
        this.toastrService.success('The promotion is created successfully!', 'Success!');
      }
      this.router.navigate(['/tariff/promotions']);
    } catch (e) {
      this.toastrService.error(e.message ? e.message : 'Something went wrong', 'Error');
    } finally {
      this.loaderService.disable();
    }
  }

  checkExpired(promotion) {
    return !!promotion.date_end && new Date(promotion.date_end) < this.today;
  }

  onBack() {
    this.location.back();
  }

}
