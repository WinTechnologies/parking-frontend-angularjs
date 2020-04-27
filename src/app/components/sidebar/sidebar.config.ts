export const sidebarConfig = {
  maps: {
    enabled: true,
    features: [
      'global_maps_filter',
      'global_maps_predictive'
      ]
  },
  analytics: {
    enabled: false,
    features: 'global_analytics'
  },
  crmJobs: {
    enabled: false,
    features: 'crm_jobs_view'
  },
  crmContraventions: {
    enabled: false,
    features: 'crm_contravention_view'
  },
  projects: {
    enabled: false,
    features: 'project_manage'
  },
  hrEmployee: {
    enabled: false,
    features: 'hr_employee'
  },
  hrWorkplan: {
    enabled: false,
    features: 'hr_workplan'
  },
  hrAssignment: {
    enabled: false,
    features: 'hr_assignment'
  },
  adminUsersRights: {
    enabled: false,
    features: 'admin_users_rights'
  },
  adminRightsTemplates: {
    enabled: false,
    features: 'admin_rights_template'
  },

  adminCredentials: {
    enabled: false,
    features: 'admin_credentials'
  },

  assets: {
    enabled: false,
    features: 'global_assets'
  },
  tariffEnforcement: {
    enabled: false,
    features: [
      'tariff_enforcement_violation',
      'tariff_enforcement_group',
      'tariff_enforcement_escalation'
      ]
  },
  tariffValueAdded: {
    enabled: false,
    features: 'tariff_valueadded'
  },
  tariffPromotion: {
    enabled: false,
    features: 'tariff_promotion'
  },
  settingDefaultValue: {
    enabled: false,
    features: 'setting_default_value'
  },
  operationCnReview: {
    enabled: false,
    features: 'enforcement_cn_review'
  },
  operationCnChallenge: {
    enabled: false,
    features: 'enforcement_cn_challenge'
  }
};