import * as moment from 'moment';
import * as L from 'leaflet';
import {Review} from './review';
import {Challenge} from './challenge';

const ContraventionIcon = L.Icon.extend({
    options: {
        // shadowUrl: '/assets/contravention-icons/marker-shadow.png',
        iconUrl: '/assets/contravention-icons/contravention.svg',
        iconRetinaUrl: '/assets/contravention-icons/contravention.svg',
        iconSize: [48, 48],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [48, 48]
    }
});

export class Contravention {
    cn_number: number;
    cn_number_offline: string;
    creation_gmt: string;
    creation: string;
    address_simplified: string;
    amount: number;
    is_paid: boolean;
    car_plate: string;
    car_plate_ar: string;
    car_type: string;
    car_brand: string;
    car_model: string;
    car_color: string;
    car_color_ar: string;
    plate_country: string;
    plate_picture: string;
    plate_type: string;
    plate_type_ar: string;
    creator_id: string;
    creator_username: string;
    latitude: number;
    longitude: number;
    reference: string;
    site_id: string;
    site_name: string;
    violation: string;
    violation_ar: string;
    violation_id: string;
    violation_picture: string;
    observation_time: number;
    project_id: number;
    project_name: string;
    zone_id: string;
    zone_name: string;
    city_cd: string;
    intersection_cd: string;
    intersection_name_en: string;
    intersection_name_ar: string;
    street_cd: string;
    street_name_en: string;
    street_name_ar: string;
    status: string;
    status_review: string;
    status_challenge: string;
    sent_by: string;
    mapdata: string;
    status_name?: string;
    evolved_into_cn_at: string;
    gmt?: string;
    violation_code: string;
    cn_reviews?: Review[];
    cn_challenges?: Challenge[];

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getContraventionTypeDefaultIcon() {
        return new ContraventionIcon();
    }

    static getContraventionIcon() {
        return new ContraventionIcon();
    }

    static getContraventionStatus() {
        return [
            'Observation',
            'Contravention'
        ];
    }
}

export class ChallengedCN extends  Contravention {
    review_id: number;
    challenge_reason: string;
    data_modification: string | any; // JSON detail
    error: string;
    reviewed_at: string | Date;
    reviewed_by: string;

    challenge_id: number;
    decision_reason: string;
    requested_at: string | Date;
    requested_by: string;
    requester_username: string;

    constructor(param) {
      super(param);
      this.review_id = param.review_id;
      this.challenge_reason = param.challenge_reason;
      this.data_modification = param.data_modification;
      this.error = param.error;
      this.reviewed_at = param.reviewed_at;
      this.reviewed_by = param.reviewed_by;

      this.challenge_id = param.challenge_id;
      this.decision_reason = param.decision_reason;
      this.requested_at = param.requested_at;
      this.requested_by = param.requested_by;
      this.requester_username = param.requester_username;
    }
  }
