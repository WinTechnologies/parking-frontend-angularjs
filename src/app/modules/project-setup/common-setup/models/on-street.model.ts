export enum OnStreetType {
  Parking = 0,
  Signage,
  ParkingMeter,
  Zone,
  OpenLand,
}

export class OnStreetItem {
  type: OnStreetType;
  icon: string;
  name: string;
}

export const gOnStreetItmes: OnStreetItem[] = [
  {type: OnStreetType.Parking, icon: 'assets/project-setup/onstreet/parking.svg', name: 'Parking'},
  {type: OnStreetType.Signage, icon: 'assets/project-setup/onstreet/signage.svg', name: 'Signage'},
  {type: OnStreetType.ParkingMeter, icon: 'assets/project-setup/onstreet/parking_meter.svg', name: 'Parking Meter'},
  {type: OnStreetType.Zone, icon: 'assets/project-setup/onstreet/zone.svg', name: 'Zone'},
  {type: OnStreetType.OpenLand, icon: 'assets/project-setup/onstreet/open_land.svg', name: 'Open Land'},
];
