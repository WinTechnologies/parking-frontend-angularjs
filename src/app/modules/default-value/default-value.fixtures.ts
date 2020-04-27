export interface DefaultValueColumn {
  name: string;
  label: string;
  editable: boolean;
  type: string;
  min?: number;
  max?: number;
  isShow?: boolean;
}

export interface DefaultValueList {
  name: string;
  title: string;
  apiEndpoint: string;
  tableFields?: DefaultValueColumn[];
  showFields?: DefaultValueColumn[];
}

export interface DefaultValueType {
  name: string;
  title: string;
  lists: DefaultValueList[];
}

export const defaultValueTypes: DefaultValueType[] = [
  {
    name: 'department',
    title: 'Working department',
    lists: [
      {
        name: 'department',
        title: 'Working department',
        apiEndpoint: 'department',
        tableFields: [
          {name: 'department_code', label: 'Code', editable: false, type: 'text', isShow: true},
          {name: 'department_name', label: 'Name', editable: true, type: 'name', isShow: true},
        ],
        showFields: [],
      }
    ],
  },
  {
    name: 'position',
    title: 'Working Positions',
    lists: [
      {
        name: 'Job Type',
        title: 'Job Types',
        apiEndpoint: 'job_type',
        tableFields: [
          {name: 'code', label: 'Code', editable: false, type: 'text', isShow: true},
          {name: 'name', label: 'Name', editable: true, type: 'name', isShow: true},
        ],
        showFields: [],
      },
      {
        name: 'position',
        title: 'Working Positions',
        apiEndpoint: 'position',
        tableFields: [
          {name: 'code', label: 'Code', editable: false, type: 'text', isShow: true},
          {name: 'name', label: 'Name', editable: true, type: 'name', isShow: true},
          {name: 'type_job_id', label: 'Job Type ID', editable: true, type: 'job_type_id', isShow: false},
          {name: 'type_job_name', label: 'Job Type', editable: true, type: 'job_type', isShow: true},
        ],
        showFields: [],
      },
    ],
  },
  {
    name: 'city',
    title: 'Cities',
    lists: [
      {
        name: 'city',
        title: 'Cities',
        apiEndpoint: 'city',
        tableFields: [
          {name: 'city_code', label: 'Code', editable: false, type: 'text', isShow: true},
          {name: 'city_code_pin', label: 'Code PIN', editable: true, type: 'codePin', isShow: true},
          {name: 'city_name', label: 'Name', editable: true, type: 'name', isShow: true},
        ],
        showFields: [],
      }
    ],
  },
  {
    name: 'vat',
    title: 'Vat',
    lists: [
      {
        name: 'vat',
        title: 'Vat',
        apiEndpoint: 'vat',
        tableFields: [
          {name: 'vat_code', label: 'Vat Code', editable: false, type: 'text', isShow: true},
          {name: 'vat_percentage', label: 'Percentage', editable: true, type: 'number', min: 0, max: 100, isShow: true},
          {name: 'vat_country', label: 'Country', editable: true, type: 'country', isShow: true},
          {name: 'vat_name', label: 'Name', editable: true, type: 'name', isShow: true},
        ],
        showFields: [],
      }
    ],
  },
  {
    name: 'incident',
    title: 'Incident',
    lists: [
      {
        name: 'incident',
        title: 'Incident',
        apiEndpoint: 'incident',
        tableFields: [
          {name: 'img_url', label: 'Icon', editable: true, type: 'file', isShow: true},
          {name: 'code', label: 'Code', editable: true, type: 'text', isShow: true},
          {name: 'name_en', label: 'Name EN', editable: true, type: 'text', isShow: true},
          {name: 'name_ar', label: 'Name AR', editable: true, type: 'text', isShow: true},
          {name: 'description', label: 'Description', editable: true, type: 'textarea', isShow: true},
          {name: 'created_by', label: 'Created by', editable: true, type: 'text', isShow: true},
          {name: 'created_at', label: 'Created at', editable: true, type: 'text', isShow: true},
        ],
        showFields: [],
      }
    ],
  }
];
