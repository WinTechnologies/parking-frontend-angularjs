import {Address} from './address';

export class User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  entitle: string;
  usertype: string;
  password: string;
  zonerights: string;
  teamright?: string;
  siteright?: string;
  picture?: string;
  address: Address;
  team?: string;
  selected?: boolean;
  site_id: string;
  site_name?: string;
  project_id?: number;
  project_name?: string;
  phone?: string;
  assigned_vehicle?: string;
  except_assigned_vehicle?: string;
  eod?: string;
  constructor(values: Object = {}) {
    Object.assign(this, values);
    if(!values['address']) this.address = new Address();
  }
}
