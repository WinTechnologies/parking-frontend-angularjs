import { PromotionParking } from './shared.model';

export class Promotion {
  id: number;
  promo_code: string;
  promo_name_en: string;
  promo_name_ar: string;
  activity: string;
  discount_value: number;
  discount_percetage: number;
  credit_value: number;
  min_spending: number;
  nbr_instances: number;
  nbr_instances_per_user: number;
  date_start: string;
  date_end: string;
  timeslot: string;
  working_days: string;
  term_conditions: string;
  date_created: string;

  promotionParkings: PromotionParking[];
  // parking Ids
  selectedParkings: any[];

  constructor() {
    this.promo_code = null;
    this.promo_name_en = null;
    this.promo_name_ar = null;
    this.activity = null;
    this.discount_value = null;
    this.discount_percetage = null;
    this.credit_value = null;
    this.min_spending = null;
    this.nbr_instances = null;
    this.nbr_instances_per_user = null;
    this.date_start = null;
    this.date_end = null;
    this.timeslot = null;
    this.working_days = null;
    this.term_conditions = null;
    this.promotionParkings = [];
    this.selectedParkings = [];
  }
}
