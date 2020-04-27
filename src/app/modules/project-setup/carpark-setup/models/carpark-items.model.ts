import {LengthUnit} from '../../common-setup/models/onstreet/project_zone.model';

export class Terminal {
  id: number;
  project_id: number;
  zone_id: number; /* reference to ProjectZone Model */
  terminal_code: string;
  terminal_name: string;
  airport_code: string;
  airport_name: string;
  latitude: number;
  longitude: number;
  connecting_points: string;
  img_url: string;
  notes: string;
  created_at: Date;
  created_by: string;
}
export const EmptyTerminal = new Terminal();

export class Airport {
  iata: string;
  icao: string;
  name: string;
  location: string;
  timezone: string;
  dst: string;
}

export class CarparkType {
  id: number;
  code: string;
  name: string;
}

export enum Automated {
  Yes = 'yes',
  No = 'no',
}

export const ManagedByTypes = ['Mawgif', 'Unmanaged'];

export class Parking {
  id: number;
  zone_id: number; /* reference to ProjectZone Model */
  terminal_id: number; /* reference to Terminal Model */
  type_id: number; /* reference to CarparType */
  carpark_type: CarparkType;
  code: string;
  carpark_name: string;
  name_ar: string;
  latitude: number;
  longitude: number;
  connecting_points: string;
  img_url: string;
  is_automated: Automated;
  operation_type: string;
  managed_by: string;
  created_at: Date;
  created_by: string;
}
export const EmptyParking = new Parking();

export class ParkLevel {
  id: number;
  carpark_id: number; /* reference to Parking Model */
  code: string;
  name: string;
  img_url: string;
  connecting_points: string;
  n_parking_lots: number;
  notes: string;
  created_at: Date;
  created_by: string;
}
export const EmptyParkLevel = new ParkLevel();

export class ParkZone {
  id: number;
  carpark_id: number; /* reference to Parking Model */
  level_id: number; /* reference to ParkLevel Model */
  name_en: string;
  name_ar: string;
  latitude: number;
  longitude: number;
  connecting_points: string;
  img_url: string;
  area: number;
  perimeter: number;
  measurement_unit: LengthUnit;
  n_parking_lots: number;
  created_at: Date;
  created_by: string;
}
export const EmptyParkZone = new ParkZone();

export class ParkSpace {
  id: number;
  carpark_zone_id: number; /* reference to ParkZone Model */
  code: string;
  name: string;
  img_url: string;
  notes: string;
  vehicle_type_id: number;
  for_handicap: boolean;
  is_sensor: boolean;
  latitude: number;
  longitude: number;
  created_at: Date;
  created_by: string;
}
export const EmptyParkSpace = new ParkSpace();

export class Gate {
  id: number;
  carpark_zone_id: number; /* reference to ParkZone Model */
  name_en: string;
  name_ar: string;
  img_url: string;
  latitude: number;
  longitude: number;
  connecting_points: string;
  created_at: Date;
  created_by: string;
}
export const EmptyGate = new Gate();

export class Lane {
  id: number;
  gate_id: number; /* reference to Gate Model */
  name_en: string;
  name_ar: string;
  latitude: number;
  longitude: number;
  connecting_points: string;
  created_at: Date;
  created_by: string;
}
export const EmptyLane = new Lane();

export class VehicleType {
  id: number;
  type_en: string;
  type_ar: string;
  img_url: number;
  created_at: Date;
}

export class Assets {
  codification_id: string;
  latitude: number;
  longitude: number;
  model_id: number;
  status: string;
  project_id: number;
  zone_id: number; /* reference to ProjectZone Model */
  parking_id: number;
  carpark_id: number;
  carpark_zone_id: number;
  deployed_at: Date;
  model: string;
}
