import { TariffInterval } from './tariff-interval.model';

export class TariffSegment {
  id: number;
  segment_name: string;
  type_client: string;
  time_handling: string;
  type_tariff: string;
  price_max: number;
  project_id: number;
  zone_id: number;
  date_start: any;
  date_end: any;
  time_start: any;
  time_end: any;
  applicable_days: string;
  time_step_custom: string;
  is_onstreet: boolean;
  is_carpark: boolean;
  parking_id: number;
  carpark_id: number;
  carpark_zone_id: number;
  intervals?: TariffInterval[];

  created_at: any;
  created_by: string;
  deleted_at: any;
  deleted_by: string;

  constructor() {
    this.segment_name = null;
    this.type_client = null;
    this.time_handling = null;
    this.type_tariff = null;
    this.project_id = null;
    this.zone_id = null;
    this.date_start = null;
    this.date_end = null;
    this.time_start = null;
    this.time_end = null;
    this.applicable_days = null;
    this.parking_id = null;
    this.carpark_id = null;
    this.carpark_zone_id = null;
  }
}
