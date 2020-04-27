import * as moment from 'moment';
import * as L from 'leaflet';
import { icon } from 'leaflet';

const JobTypeIcon = L.Icon.extend({
    options: {
        // shadowUrl: '/assets/job-icons/marker-shadow.png',
        iconUrl: '/assets/job-icons/marker-icon.png',
        iconRetinaUrl: '/assets/job-icons/marker-icon.png',
        iconSize: [48, 48],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [48, 48]
    }
});

export class Job {
    job_number: number;
    job_type: string;
    creation_gmt: string;
    cn_number: string;
    cn_number_offline: string;
    cn_category: string;
    address_simplified: string;
    car_plate: string;
    car_plate_ar: string;
    car_brand: string;
    car_model: string;
    car_color_ar: string;
    car_color: string;
    plate_country: string;
    plate_type: string;
    plate_type_ar: string;
    cancel_reason: string;
    car_pound_id: number;
    clamp_barcode: string;
    clamp_pictures: string;
    creator_id: string;
    creator_username: string;
    taker_id: string;
    taker_username: string;
    end_date: string;
    latitude: number;
    longitude: number;
    latitude_towing_delivered: number;
    longitude_towing_delivered: number;
    latitude_towing_pickup: number;
    longitude_towing_pickup: number;
    geolocation_towing: string;
    mapdata: string;
    reference: string;
    related_clamp_job_id: string;
    custom_job_description: string;
    project_id: number;
    project_name: string;
    vehicle_codification: string;
    violation_id: string;
    violation: string;
    violation_pictures: string;
    amount: number;
    is_paid: boolean;
    zone_id: string;
    zone_name: string;
    city_cd: string;
    intersection_cd: string;
    intersection_name_en: string;
    intersection_name_ar: string;
    street_cd: string;
    street_name_ar: string;
    street_name_en: string;
    status: string;
    date_end_gmt: string;
    date_start_gmt: string;
    sent_by: string;
    carpark_name?: string;
    vehicle_plate?: string;
    history: string;
    canceled_by: string;
    canceled_at_gmt: string;
    gmt?: string;
    cancellation_reason_name_en?: string;
    cancellation_reason_name_ar?: string;
    cancellation_reason_job_action_code?: string;
    tow_pictures?: string;
    declamp_pictures?: string;
    defect_pictures?: string;
    defect_infos?: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }


    static getJobTypeDefaultIcon() {
        return new JobTypeIcon();
    }

    static getJobIcon(type, status) {
        let icon_name;

        if (type === 'TOW JOB') {
            // icon_name = 'tow_open';

            if (status === 'Open') icon_name = 'tow_open';
            if (status === 'TOW REQUESTED') icon_name = 'tow_open';
            if (status === 'TOWED') icon_name = 'tow_active';
            if (status === 'RELEASED') icon_name = 'tow_paid';
            if (status === 'Towing in progress') icon_name = 'tow_towing_in_progress';
            if (status === 'TOW IN ROUTE') icon_name = 'tow_towing_in_progress';
            if (status === 'Delivery in progress') icon_name = 'tow_delivery_in_progress';
            if (status === 'Closed') icon_name = 'tow_closed';
            if (status === 'CANCELED') icon_name = 'tow_canceled';
            if (status === 'Paid') icon_name = 'tow_paid';
            if (status === 'COMPLETE') icon_name = 'tow_paid';
            if (status === 'MISSED') icon_name = 'tow_missed';
        }

        if (type === 'CLAMP JOB') {
            // icon_name = 'clamp_open';

            if (status === 'Open') icon_name = 'clamp_open';
            if (status === 'CLAMPED') icon_name = 'clamp_active';
            if (status === 'CLAMPED REQUESTED') icon_name = 'clamp_open';
            if (status === 'CLAMP REQUESTED') icon_name = 'clamp_open';
            if (status === 'TOW REQUESTED') icon_name = 'tow_open';
            if (status === 'RELEASED') icon_name = 'clamp_paid';
            if (status === 'COMPLETE') icon_name = 'clamp_paid';
            if (status === 'In progress') icon_name = 'clamp_in_progress';
            if (status === 'Active') icon_name = 'clamp_active';
            if (status === 'Closed') icon_name = 'clamp_closed';
            if (status === 'Canceled') icon_name = 'clamp_canceled';
            if (status === 'MISSED') icon_name = 'clamp_missed';
        }

        if (type === 'DECLAMP JOB') {
            // icon_name = 'de_clamp_open';

            if (status === 'Open') icon_name = 'de_clamp_open';
            if (status === 'DECLAMP REQUESTED') icon_name = 'de_clamp_open';
            if (status === 'In progress') icon_name = 'de_clamp_in_progress';
            if (status === 'DECLAMP IN ROUTE') icon_name = 'de_clamp_in_progress';
            if (status === 'Closed') icon_name = 'de_clamp_closed';
            if (status === 'CANCELED') icon_name = 'de_clamp_canceled';
            if (status === 'Paid') icon_name = 'de_clamp_paid';
            if (status === 'RELEASED') icon_name = 'de_clamp_paid';
            if (status === 'MISSED') icon_name = 'de_clamp_missed';
        }

        if (type === 'CLAMP TO TOW') {
            // icon_name = 'clamp_to_tow_active';

            if (status === 'Active') icon_name = 'clamp_to_tow_active';
            if (status === 'Closed') icon_name = 'clamp_to_tow_closed';
            if (status === 'Canceled') icon_name = 'clamp_to_tow_canceled';
            if (status === 'Paid') icon_name = 'clamp_to_tow_paid';
            if (status === 'MISSED') icon_name = 'clamp_to_tow_missed';
        }

        // const icon = icon_name ? new JobTypeIcon({ iconUrl: '/assets/job-icons/' + icon_name + '.svg' })  : new JobTypeIcon();

        return icon_name;
    }

    static getJobTypes() {
        return [
            'CLAMP TO TOW',
            'TOW JOB',
            'DECLAMP JOB',
            'CLAMP JOB'
        ];
    }

    static getJobStatus() {
        return [
            'Open',
            'Tow Requested',
            'In progress',
            'Towing in progress',
            'Delivery in progress',
            'Active',
            'Closed',
            'Canceled',
            'Paid',
            'MISSED'
        ];
    }

    static getJobStatusByJobType(job_type) {

        let jobStatusOptions = [];

        switch (job_type) {
            case 'CLAMP-TO-TOW':
                jobStatusOptions = [
                    'Active',
                    'Closed',
                    'Canceled',
                    'Paid',
                    'MISSED'
                ];
                break;
            case 'TOW JOB':
                jobStatusOptions = [
                    'Open',
                    'Towing in progress',
                    'Delivery in progress',
                    'Closed',
                    'Canceled',
                    'Paid',
                    'MISSED'
                ];
                break;
            case 'DECLAMP':
                jobStatusOptions = [
                    'Open',
                    'In progress',
                    'Closed',
                    'Canceled',
                    'Paid',
                    'MISSED'
                ];
                break;
            case 'CLAMP JOB':
                jobStatusOptions = [
                    'Open',
                    'In progress',
                    'Active',
                    'Closed',
                    'Canceled',
                    'MISSED'
                ];
                break;
            default: break;
        }

        return jobStatusOptions;
    }
}

