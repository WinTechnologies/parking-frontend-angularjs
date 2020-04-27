export interface OrgChartItem {
  fullname: string;
  employee_id: string;
  project_id: number;
  supervisor_id: string;
  position: string;
  children?: OrgChartItem[];
  project_employee_id?: number;
}
