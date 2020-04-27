import {Address} from './address';

export class Site {
  id: string;
  name: string;
  address: Address;
  type: string;
  project_id: number;
  mapdata: string;
  optimal_drivers_count: number; // Number of drivers a site should have;
  optimal_enforcers_count: number; // Number of enforcers a site should have;
  jobs_target: number; // Jobs target per day per driver
  cn_target: number; // CN target per day per enforcer

  constructor(values: Object = {}) {
    this.address = new Address();
    Object.assign(this, values);
  }
}
