export enum AssetFieldType {
  TextInput = 0,
  Calendar,
  Droplist,
  CheckboxList,
  UploadImage,
  CalendarRange,
}

export class AssetField {
  name: string;
  type: AssetFieldType;
  options: string[];
}

export class Asset {
  codification_id: string;
  type_asset?: string;
  model_id?: number;
  model_code?: string;
  model_txt?: string;
  model_img_url?: string;
  img_url: string;
  latitude: number;
  longitude: number;
  status: string;
  status_vehicle?: string;
  created_at: string;
  deployed_at: string;
  eol_at: string;
  warranty_until: string;
  notes: string;
  ip_address: string;
  vehicle_plate: string;
  vehicle_plate_ar: string;
  vehicle_brand: string;
  vehicle_country: string;
  configurations: string;
  fullspecs_link: string;
  manufacturer?: string;
  firmware_version?: string;
  project_id: number;
  project_name?: string;
  zone_id?: number;
  zone_code?: string;
  zone_txt?: string;
  city_txt?: string;
  carpark_zone_id?: number;
  carpark_id?: number;
  parking_id?: number;
  created_by: string;
}

export class AssetModel {
  id: number;
  code: string;
  name: string;
  type_id: number;
  notes: string;
  created_by: string;
  manufacturer: string;
  configurations: string;
  firmware_version: string;
  product_warranty: string;
  img_url: string;
  fullspecs_link: string;
  type_asset?: string;
  instance_count?: number;
  instances?: Asset[];
  category_asset?: string;
}

export class AssetType {
  id?: number;
  code: string;
  name: string;
  icon_url: string;
  created_by: string;
  category_asset?: string;
  category_id?: number;
  created_at?: string;
  model_count?: number;
  models?: AssetModel[];
  total?: number;
  installed?: number;
  available?: number;
}

export const globalAssetFields: AssetField[] = [
  {
    name: 'Installed',
    type: AssetFieldType.Droplist,
    options: ['No', 'Yes']
  },
  {
    name: 'Project',
    type: AssetFieldType.Droplist,
    options: ['Project1', 'Project2']
  },
  {
    name: 'Site',
    type: AssetFieldType.Droplist,
    options: ['Under Bridge Jeddah', 'Under Bridge Jeddah 2']
  },
  {
    name: 'Zone',
    type: AssetFieldType.Droplist,
    options: ['Zone 1', 'Zone 2', 'Zone 3']
  },
  {
    name: 'Asset ID',
    type: AssetFieldType.TextInput,
    options: []
  },
  {
    name: 'GPS',
    type: AssetFieldType.Droplist,
    options: ['Yes', 'No']
  },
  {
    name: 'Reference',
    type: AssetFieldType.Droplist,
    options: ['Project1', 'Project2']
  },
  {
    name: 'Manufacturer',
    type: AssetFieldType.Droplist,
    options: ['XYCZ', 'AAA']
  },
  {
    name: 'Supplier',
    type: AssetFieldType.Droplist,
    options: ['ZXCA', 'DDDD']
  },
  {
    name: 'Firmware Version',
    type: AssetFieldType.TextInput,
    options: []
  },
  {
    name: 'Software Version',
    type: AssetFieldType.TextInput,
    options: []
  },
  {
    name: 'Date of Installation',
    type: AssetFieldType.Calendar,
    options: []
  },
  {
    name: 'Status',
    type: AssetFieldType.Droplist,
    options: ['Active', 'Installed']
  },
  {
    name: 'Model',
    type: AssetFieldType.Droplist,
    options: ['Model A', 'Model B']
  },
  {
    name: 'End of Life',
    type: AssetFieldType.Calendar,
    options: ['Project1', 'Project2']
  },
  {
    name: 'Product Warranty',
    type: AssetFieldType.Calendar,
    options: []
  },
  {
    name: 'Configurations',
    type: AssetFieldType.CheckboxList,
    options: ['Config 1', 'Config 2', 'Config 1', 'Config 2']
  },
]
