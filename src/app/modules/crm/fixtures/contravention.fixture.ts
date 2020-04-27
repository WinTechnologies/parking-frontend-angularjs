export const CN_List_Fields = [
  { name: 'car_plate', label: 'License Plate', isShow: true },
  { name: 'cn_number', label: 'CN No.', isShow: true },
  { name: 'violation', label: 'Violation', isShow: true },
  { name: 'notes', label: 'Notes', isShow: true },
  { name: 'status', label: 'Status', isShow: true },
  { name: 'creation', label: 'Created at', isShow: true },
  { name: 'category', label: 'Category', isShow: false },
  { name: 'project_id', label: 'Project ID', isShow: false },
  { name: 'project_name', label: 'Project Name', isShow: false },
  { name: 'car_type', label: 'Car Type', isShow: false },
  { name: 'car_model', label: 'Model EN', isShow: false },
  { name: 'car_color', label: 'Color EN', isShow: false },
  { name: 'plate_country', label: 'Country', isShow: false },
  { name: 'cn_number_offline', label: 'CN No. Offline', isShow: false },
  { name: 'car_plate_ar', label: 'Car Plate AR', isShow: false },
  { name: 'car_brand', label: 'Brand EN', isShow: false },
  { name: 'car_brand_ar', label: 'Brand AR', isShow: false },
  { name: 'car_color_ar', label: 'Color AR', isShow: false },
  { name: 'plate_type', label: 'Plate Type EN', isShow: false },
  { name: 'plate_type_ar', label: 'Plate Type AR', isShow: false },
  { name: 'creator_id', label: 'Creator', isShow: false },
  { name: 'reference', label: 'OSES Reference', isShow: false },
  { name: 'zone_name', label: 'Zone', isShow: false },
  { name: 'city_code', label: 'City Code', isShow: false },
  { name: 'intersection_cd', label: 'Intersection Code', isShow: false },
  { name: 'street_name_ar', label: 'Street AR', isShow: false },
  { name: 'street_name_en', label: 'Street EN', isShow: false },
  { name: 'status_review', label: 'Review Status', isShow: false },
  { name: 'status_challenge', label: 'Challenge Status', isShow: false },
  { name: 'violation_code', label: 'Violation Code', isShow: false },
  { name: 'evolved_into_cn_at', label: 'Into CN at', isShow: false },
  { name: 'amount', label: 'Amount', isShow: false },
  { name: 'canceled_at', label: 'Canceled at', isShow: false },
  { name: 'canceled_by', label: 'Canceled by', isShow: false },
  { name: 'sent_by', label: 'Sent by', isShow: false },
  { name: 'sent_at', label: 'Sent at', isShow: false }
];

export const CN_Details_Fields = [
  {
    sectionTitle: 'Vehicle Information',
    fields: [
      { name: 'car_plate', label: 'Car Plate' },
      { name: 'car_plate_ar', label: 'Car Plate (Arabic)' },
      { name: 'plate_type', label: 'Plate Type' },
      { name: 'plate_type_ar', label: 'Plate Type (Arabic)' },
      { name: 'plate_country', label: 'Plate Country' },
      { name: 'plate_country_ar', label: 'Plate Country (Arabic)' },
      { name: 'car_brand', label: 'Car Brand' },
      { name: 'car_brand_ar', label: 'Car Brand (Arabic)' },
      { name: 'car_model', label: 'Car Model' },
      { name: 'car_model_ar', label: 'Car Model (Arabic)' },
      { name: 'car_type', label: 'Car Type' },
      { name: 'car_type_ar', label: 'Car Type (Arabic)' },
      { name: 'car_color', label: 'Car Color' },
      { name: 'car_color_ar', label: 'Car Color (Arabic)' }
    ]
  },
  {
    sectionTitle: 'Violation Information',
    fields: [
      { name: 'cn_number', label: 'CN #' },
      { name: 'cn_number_offline', label: 'CN Offline #' },
      { name: 'violation', label: 'Violation Type' },
      { name: 'violation_ar', label: 'Violation Type (Arabic)' },
      { name: 'contravention_created_at', label: 'Created at' },
      { name: 'category', label: 'Status' },
      { name: 'amount', label: 'Amount' },
      { name: 'creator_id', label: 'Creator Id' },
      { name: 'creator_name', label: 'Created by' },
      { name: 'violation_code', label: 'Violation Code' },
      { name: 'observation_time', label: 'Obs. Time(min)' },
      { name: 'is_paid', label: 'Payment' },
      { name: 'reference', label: 'Ref. OSES' },
      { name: 'project_code', label: 'Project Code' },
      { name: 'project_name', label: 'Project' },
      { name: 'zone_name', label: 'Zone' },
      { name: 'street_name_en', label: 'Main Street' },
      { name: 'street_name_ar', label: 'Main Street (Arabic)' },
      { name: 'intersection_name_en', label: 'Intersection' },
      { name: 'intersection_name_ar', label: 'Intersection (Arabic)' },
      { name: 'notes', label: 'Notes' }
    ]
  },
  {
    sectionTitle: 'Observation Information',
    fields: [
      { name: 'creation', label: 'Observation Start' },
      { name: 'contravention_created_at', label: 'Observation End' },
      { name: 'creator_name', label: 'Created by' },
      { name: 'creator_id', label: 'Creator ID' }
    ]
  },
  {
    sectionTitle: 'Cancellation Information',
    fields: [
      { name: 'canceled_at', label: 'Canceled At'},
      { name: 'canceled_by', label: 'Canceled by'},
    ]
  },
  {
    sectionTitle: 'Other Information',
    fields: [
      { name: 'status', label: 'Status' },
      { name: 'status_review', label: 'Review' },
      { name: 'status_challenge', label: 'Challenge' },
      { name: 'sent_by', label: 'Sent by' },
      { name: 'sent_at', label: 'Sent at' }
    ]
  }
];

export const CN_Status = [
  { type: 'OBSERVATION', status: 'IN PROGRESS', color: '#f2f2f2' },
  { type: 'OBSERVATION', status: 'READY TO USE', color: '#efa170' },
  { type: 'OBSERVATION', status: 'CANCELED', color: '#ffff0b' },
  { type: 'CONTRAVENTION', status: 'OBSERVATION CONTRAVENTION', color: '#149fec' },
  { type: 'CONTRAVENTION', status: 'CONTRAVENTION', color: '#244185' },
  { type: 'CONTRAVENTION', status: 'CANCELED', color: '#fb0007' },
  { type: 'CONTRAVENTION', status: 'PAID', color: '#16a53f' }
];