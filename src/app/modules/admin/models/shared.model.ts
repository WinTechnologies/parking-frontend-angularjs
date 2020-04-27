export class PermissionType {
  id: number;
  permission_type: string;
  is_off: boolean;
  is_view: boolean;
  is_create: boolean;
  is_update: boolean;
  is_delete: boolean;
  permission_desc: boolean;
}

export class PermissionFeature {
  id: string;
  feature_name: string;
  section: string;
  feature: string;
  feature_desc: string;
  permission_type: string;
}

export class EmployeePermission {
  employee_id: string;
  permission_template_id: number;
}