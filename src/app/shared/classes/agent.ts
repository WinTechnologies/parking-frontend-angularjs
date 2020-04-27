import * as L from 'leaflet';
import { Marker } from 'leaflet';

import { Address } from './address';
import { User } from './user';

const UserTypeIcon = L.Icon.extend({
  options: {
    // shadowUrl: '/assets/user-icons/marker-shadow.png',
    iconUrl: '/assets/user-icons/marker-icon.png',
    iconRetinaUrl: '/assets/user-icons/marker-icon-2x.png',
    iconSize: [48, 48],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [48, 48]
  }
});

export class Agent extends User {
  public static color? = '#BDBDBD';
  mapdata: string;
  constructor(mapdata: string, id: string, username: string, first_name: string, last_name: string, entitle: string, usertype: string, password: string, zonerights: string, address: Address, teamright = null, siteright = null, picture = null, team = null) {
    super();
    this.mapdata = mapdata;
    this.id = id;
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.entitle = entitle;
    this.usertype = usertype;
    this.password = password;
    this.zonerights = zonerights;
    this.address = address;
    this.teamright = teamright;
    this.address = address;
    this.siteright = siteright;
    this.team = team;
    this.picture = picture;
  }

  static getUserIcon(type_name) {
    let icon_name;

    switch (type_name) {
      case 'Enforcer':
        icon_name = 'enforcer';
        break;
      case 'Driver':
        icon_name = 'driver';
        break;
      case 'Clamper':
        icon_name = 'clamper';
        break;
      default: break;
    }

   // return new UserTypeIcon({ iconUrl: './assets/user-icons/' + icon_name + '.svg' });
  }
}

