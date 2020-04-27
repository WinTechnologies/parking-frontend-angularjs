export const configAdmin = {
  defaultPermissionType: {
    permission_type: 'permission_type_1',
    is_off: false,
    is_view: false,
    is_create: false,
    is_update: false,
    is_delete: false
  },
  offPermissionType: 'permission_type_1',
  availableSections: ['MAPS', 'Projects', 'Analytics', 'CRM', 'HR', 'Admin', 'Assets', 'Tariff'],
  requiredFeatures: {
    globalMaps: ['global_maps_filter', 'global_maps_predictive'],
    employeeList: ['hr_employee']
  }
};
