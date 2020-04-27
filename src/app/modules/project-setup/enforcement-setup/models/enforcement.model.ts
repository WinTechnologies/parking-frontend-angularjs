export enum EnforcementType {
  EO = 0,
  Enforcer,
  EOD,
  Driver,
  Devices,
  Truck,
  Van,
  Clamp,
  TowTrucks,
  ClampVanes,
  Tariff,
  Routes,

}

export class EnforcementItem {
  type: EnforcementType;
  icon: string;
  name: string;
}

export const gEnforcementItems: EnforcementItem[] = [
  {type: EnforcementType.Enforcer, icon: 'assets/enforcementsetup/eo_icon.svg', name: "EO's"},
  {type: EnforcementType.EOD, icon: 'assets/enforcementsetup/eod_icon.svg', name: "EOD's"},
  {type: EnforcementType.Driver, icon: 'assets/enforcementsetup/driver_icon.svg', name: "Drivers"},
  {type: EnforcementType.Devices, icon: 'assets/enforcementsetup/devices_icon.svg', name: "Devices"},
  {type: EnforcementType.Truck, icon: 'assets/enforcementsetup/tow truck_icon.svg', name: "Tow Trucks"},
  {type: EnforcementType.Van, icon: 'assets/enforcementsetup/clamp vans_icons.svg', name: "Clamp Vans"},
  {type: EnforcementType.Clamp, icon: 'assets/enforcementsetup/clamps_icon.svg', name: "Clamps"},
  {type: EnforcementType.Tariff, icon: 'assets/enforcementsetup/tariff_icon.svg', name: "Tariff"},
  {type: EnforcementType.Routes, icon: 'assets/enforcementsetup/route_icon.svg', name: "Routes"},
];

export const EmployeeTypesForRoutes = ['Enforcer', 'Enforcer-Driver', 'Driver'];
