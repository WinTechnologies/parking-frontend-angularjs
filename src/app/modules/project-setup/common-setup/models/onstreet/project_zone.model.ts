export enum LengthUnit {
  Meters = 'Meters',
  Kilometers = 'Kilometers',
}

export enum AreaUnit {
  SQ_Meters = 'Sq Meters',
  SQ_Kilometers = 'Sq Kilometers',
}

export class ProjectZone {
  id: number;
  project_id: number;
  project_name?: string;
  zone_code: string;
  zone_name: string;
  zone_name_ar: string;
  perimeter: number;
  area: number;
  measurement_unit: LengthUnit;
  connecting_points: string;
  created_at: Date;
  created_by: string;
  creator_fullname: string;
}

export const EmptyPrZone = new ProjectZone();
