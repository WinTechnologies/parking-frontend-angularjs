export class PromotionParking {
  project_id: number;
  zone_id: string;
  parking_id: string;
}

export class PromotionValidation {
  activity: boolean;
  selectedParkings: boolean;
  date_start: boolean;
  min_spending: boolean;
  nbr_instances: boolean;

  constructor() {
    this.activity = false;
    this.selectedParkings = false;
    this.date_start = false;
    this.min_spending = false;
    this.nbr_instances = false;
  }
}
