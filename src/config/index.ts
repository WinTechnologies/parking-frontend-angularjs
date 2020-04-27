export const config = {
  site: {
    name: 'Mawgif Advanced Performance System',
  },
  projectTabFeatures: ['project_maps', 'project_dashboard', 'project_analytics', 'project_assets', 'project_productivity', 'project_info'],
  codeBaseDigits: 3, // Digit system for auto-generated code
  contraventionStatus: [
    'Observation',
    'Contravention',
    'Canceled Observation',
    'Evolved-into-contravention Observation',
    'Canceled Contravention'
  ],
  mqttTopics: {
    job: {
      create: 'CreatedJob',
      remove: 'RemovedJob',
      update: 'UpdatedJob',
      start: 'StartedJob'
    },
    contravention: {
      create: 'CreatedContravention',
      cancel: 'CanceledContravention',
      update: 'UpdatedContravention'
    },
    defaultValue: {
      create: 'CreatedDefaultValue',
      update: 'UpdatedDefaultValue',
      remove: 'RemovedDefaultValue'
    },
  },
  weekDays: [
    {name: 'SUN', key: 'sun'},
    {name: 'MON', key: 'mon'},
    {name: 'TUE', key: 'tue'},
    {name: 'WED', key: 'wed'},
    {name: 'THU', key: 'thu'},
    {name: 'FRI', key: 'fri'},
    {name: 'SAT', key: 'sat'},
  ],
  weekdaynames: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
  tariffParking: {
    timeSteps : [
      {text: '5 min', value: 5},
      {text: '10 min', value: 10},
      {text: '15 min', value: 15},
      {text: '30 min', value: 30},
      {text: '1h', value: 60},
      {text: '2h', value: 120},
      {text: '3h', value: 180},
    ],
    timeStepLabels: {
      '5': '5 min',
      '10': '10 min',
      '15': '15 min',
      '30': '30 min',
      '60': '1h',
      '120': '2h',
      '180': '3h'
    }
  },
  carTypes: [
    {
      name: 'PRIVATE (WHITE)',
      code: 1,
    }, {
      name: 'DIPLOMATIC (GREEN)',
      code: 2,
    }, {
      name: 'PUBLIC TRANSPORT (RED)',
      code: 3,
    }, {
      name: 'TEMPORARY (BLACK)',
      code: 4,
    }, {
      name: 'COMMERCIAL (BLUE)',
      code: 5,
    }, {
      name: 'OTHER COUNTRY',
      code: 6,
    }
],
  carCountries: ['Saudi Arab', 'Kuwait', 'Bahrain', 'Qatar', 'UAE', 'Oman', 'Jordan', 'Temporary', 'Other'],
  cnReviewStates: [
    {name: 'cn_review.unreviewed', value: 'Unreviewed'},
    {name: 'cn_review.challenged', value: 'Challenge requested'},
    {name: 'cn_review.modified', value: 'Modified'},
    {name: 'cn_review.validated', value: 'Validated'},
    {name: 'cn_review.reviewed', value: 'Challenge requested,Modified,Validated'},
  ],
  cnChallengeStates: [
    {name: 'cn_review.pending', value: 'Challenge requested'},
    {name: 'cn_review.rejected', value: 'Challenge rejected'},
    {name: 'cn_review.validated', value: 'Contravention cancelled'},
  ],
};
