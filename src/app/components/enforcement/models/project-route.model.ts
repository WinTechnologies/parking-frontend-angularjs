export class ProjectRoute {
  id: number;
  route_code: string;
  route_name: string;
  distance_mins: number;
  distance_meters: number;
  nbr_staff: number;
  connecting_points: string;
  project_id: number;
  staffs: any[];
  waypoints?: any;
  project_name?: string;
}
