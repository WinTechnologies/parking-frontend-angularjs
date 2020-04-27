export class HhdTracking {
    imei: string;
    serial_number: string;
    latitude: number;
    longitude: number;
    device_mode: string;
    battery_status: string;
    battery_level: number;
    application_name: string;
    user_status: number;
    user_id: string;
    project_id: number;

    constructor(
        imei: string,
        serial_number: string,
        latitude: number,
        longitude: number,
        device_mode: string,
        battery_status: string,
        battery_level: number,
        application_name: string,
        user_status: number,
        user_id: string,
        project_id: number
        ) {
            this.imei = imei;
            this.serial_number = serial_number;
            this.latitude = latitude;
            this.longitude = longitude;
            this.device_mode = device_mode;
            this.battery_status = battery_status;
            this.battery_level = battery_level;
            this.application_name = application_name;
            this.user_status = user_status;
            this.user_id = user_id;
            this.project_id = project_id;
        }
}