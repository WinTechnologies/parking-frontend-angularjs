
/**
 * Type Definition of Filter Form , Filter Options
 *  for Cashier, Review, Challenge page
 *  in Enforcement(CN) module
 */
export interface CNSearchFilter {
  project_id: any;
  start_date: any;
  end_date: any;
  start_time: any;
  end_time: any;
  cn_number: string;
  cn_number_offline: string;
  plate_country: string;
  plate_type: any;
  plate_num: string;
  plate_lat: string;
  taker_username: string;
  status: string;
}

export interface CNSearchValues {
  issuedCountries: string[];
  plateTypes: any[];
  projects?: any[];
  violations?: any[];
  statuses?: string[];
  challengeStatusList?: any[];
  reviewStatusList?: any[];
  escapeStatusList?: any[];
}

/**
 * Type Definition of Filter Form , Filter Options
 *  in Carpark module
 */
export interface CarparkSearchFilter {
  ticket_number: string;
  project_id: any;
  start_date: any;
  end_date: any;
  start_time: any;
  end_time: any;
  car_country: string;
  car_type: string;
  plate_num: string;
  plate_lat: string;
  isOpen: boolean;
  isClosed: boolean;
  car_park: any;
  zone: any;
  gate: any;
  lane: any;
}