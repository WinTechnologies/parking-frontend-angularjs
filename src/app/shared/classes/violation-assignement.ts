export class ViolationAssignement {
  id: string;
  violation_id: string;
  site_id: string;
  project_id: number;
  date: string;
  start_hour: string;
  end_hour: string;
  amount: number;
  payment_bluecard: boolean;
  payment_cash: boolean;
  payment_visa: boolean;
  payment_mastercard: boolean;
  name_en: string;
  name_ar: string;
  decision: string;
  site_name: string;
  zones: any[];

  constructor(id: string = '', violation_id: string = '', site_id: string = '',
              date: string = '', start_hour: string = '', project_id: number = null,
              end_hour: string = '', amount: number = 0,
              payment_bluecard: boolean = false, payment_cash: boolean = false,
              payment_visa: boolean = false, payment_mastercard: boolean = false, name_en: string = '',
              name_ar: string = '', decision: string = '', site_name: string = '', zones: any[] = []){
      this.id = id;
      this.violation_id = violation_id;
      this.site_id = site_id;
      this.project_id = project_id;
      this.date = date;
      this.start_hour = start_hour;
      this.end_hour = end_hour;
      this.amount = amount;
      this.payment_bluecard = payment_bluecard;
      this.payment_cash = payment_cash;
      this.payment_visa = payment_visa;
      this.payment_mastercard = payment_mastercard;
      this.name_en = name_en;
      this.name_ar = name_ar;
      this.decision = decision;
      this.site_name = site_name;
      this.zones = zones;
    }
}
