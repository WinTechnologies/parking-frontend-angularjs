export const Job_List_Fields = [
    { name: 'car_plate', label: 'Car Plate', isShow: true },
    { name: 'car_plate_ar', label: 'Car Plate AR', isShow: false },
    { name: 'job_number', label: 'Job Id', isShow: true },
    { name: 'project_id', label: 'Project ID', isShow: false },
    { name: 'project_name', label: 'Project Name', isShow: false },
    { name: 'car_brand', label: 'Car Brand', isShow: true },
    { name: 'car_model', label: 'Car Model', isShow: false },
    { name: 'car_color', label: 'Car Color', isShow: false },
    { name: 'plate_country', label: 'Plate Country', isShow: true },
    { name: 'plate_type', label: 'Car Type', isShow: true },
    { name: 'job_type', label: 'Type', isShow: true },
    { name: 'creation', label: 'Created date & time', isShow: true },
    { name: 'status', label: 'Status', isShow: true },
    { name: 'creator_id', label: 'Driver ID', isShow: true },
    { name: 'category', label: 'Category', isShow: false },

    { name: 'cn_number', label: 'CN Related', isShow: false },
    { name: 'cn_number_offline', label: 'CN Offline Number', isShow: false },
    { name: 'cancel_reason', label: 'Cancel Reason', isShow: false },
    { name: 'taker_username', label: 'Taker', isShow: false },
    { name: 'date_end', label: 'End at', isShow: false },
    { name: 'vehicle_codification', label: 'Vehicle', isShow: false },
    { name: 'violation', label: 'Violation', isShow: false },
    { name: 'violation_code', label: 'Violation Code', isShow: false },
    { name: 'amount', label: 'Amount', isShow: false },
    { name: 'is_paid', label: 'Payment Status', isShow: false },
    { name: 'zone_name', label: 'Zone', isShow: false },
    { name: 'city_cd', label: 'City Code', isShow: false },
    { name: 'intersection_cd', label: 'Intersection Code', isShow: false },
    { name: 'street_name_ar', label: 'Street AR', isShow: false },
    { name: 'street_name_en', label: 'Street EN', isShow: false },

    { name: 'date_start', label: 'Start at', isShow: false },
    { name: 'sent_by', label: 'Send by', isShow: false },
    { name: 'sent_at', label: 'Sent at', isShow: false },

    { name: 'cancellation_reason_name_en', label: 'Cancled Reason EN', isShow: false },
    { name: 'cancellation_reason_name_ar', label: 'Cancled Reason AR', isShow: false },
    { name: 'cancellation_reason_job_action_code', label: 'Cancellation Code', isShow: false },
    { name: 'canceled_by', label: 'Canceled By', isShow: false },
    { name: 'canceled_at', label: 'Canceled At', isShow: false },
];

export const Job_Details_Fields = [
    {
        sectionTitle: 'Vehicle Information',
        fields: [
            { name: 'car_plate', label: 'Car Plate' },
            { name: 'car_plate_ar', label: 'Car Plate (Arabic)' },
            { name: 'car_brand', label: 'Car Brand' },
            { name: 'car_model', label: 'Car Model' },
            { name: 'car_color', label: 'Car Color' },
            { name: 'car_color_ar', label: 'Car Color (Arabic)' },
            { name: 'plate_country', label: 'Plate Country' },
            { name: 'plate_type', label: 'Plate Type' },
            { name: 'plate_type_ar', label: 'Plate Type (Arabic)' },
        ]
    },
    {
        sectionTitle: 'Violation Information',
        fields: [
            { name: 'cn_number', label: 'CN #' },
            { name: 'cn_number_offline', label: 'CN No Offline' },
            { name: 'violation', label: 'Violation' },
            { name: 'violation_ar', label: 'Violation (Arabic)' },
            { name: 'creation', label: 'Created at' },
            { name: 'status', label: 'Status' },
            { name: 'amount', label: 'Amount' },
            { name: 'job_number', label: 'Job No' },
            { name: 'job_type', label: 'Type' },
            { name: 'violation_code', label: 'Violation Code' },
            { name: 'is_paid', label: 'Payment' },
            { name: 'reference', label: 'Ref. OSES' },
            { name: 'creator_name', label: 'Created by' },
            { name: 'creator_id', label: 'Creator ID' },
            { name: 'taker_username', label: 'Taker' },
            { name: 'taker_id', label: 'Taker ID' },
            { name: 'carpark_name', label: 'Carpound' },
            { name: 'street_cd', label: 'Street code' },
            { name: 'street_name_en', label: 'Street' },
            { name: 'intersection_cd', label: 'Intersection code' },
            { name: 'intersection_name_en', label: 'Intersection' },
            { name: 'zone_name', label: 'Zone' },
            { name: 'city_cd', label: 'City' },
            { name: 'project_name', label: 'Project' }
        ]
    },
    {
        sectionTitle: 'Cancellation Information',
        fields: [
            { name: 'cancellation_reason_name_en', label: 'Canceled Reason'},
            { name: 'cancellation_reason_job_action_code', label: 'Cancellation Code'},
            { name: 'canceled_at', label: 'Canceled At'},
            { name: 'canceled_by', label: 'Canceled by'},
        ]
    },
    {
        sectionTitle: 'Other Information',
        fields: [
            { name: 'vehicle_plate', label: 'Driver Vehicle License' },
            { name: 'sent_by', label: 'Sent by' },
            { name: 'sent_at', label: 'Sent at' },
        ]
    }
];


export const JobStatus = [
    { type: 'TOW', status: 'REQUESTED', color: '#f2f2f2' },
    { type: 'TOW', status: 'IN PROGRESS', color: '#4472c4' },
    { type: 'TOW', status: 'INPOUND', color: '#2f5597' },
    { type: 'TOW', status: 'RELEASED', color: '#00b050' },
    { type: 'TOW', status: 'CANCELED', color: '#ff0000' },
    { type: 'CLAMP', status: 'REQUESTED', color: '#f2f2f2' },
    { type: 'CLAMP', status: 'IN PROGRESS', color: '#4472c4' },
    { type: 'CLAMP', status: 'CLAMPED', color: '#2f5597' },
    { type: 'CLAMP', status: 'CANCELED', color: '#ff0000' },
    { type: 'DECLAMP', status: 'REQUESTED', color: '#f2f2f2' },
    { type: 'DECLAMP', status: 'IN PROGRESS', color: '#4472c4' },
    { type: 'DECLAMP', status: 'DECLAMPED', color: '#00b050' },
    { type: 'DECLAMP', status: 'CANCELD', color: '#ff0000' }
  ];