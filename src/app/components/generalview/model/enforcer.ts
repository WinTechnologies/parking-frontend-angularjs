export class Enforcer {
    latitude: number;
    longitude: number;
    firstname: string;
    lastname: string;
    phone: string;
    project_id: number;
    site_id: string;
    user_id: string;
    username: string;
    usertype: string;
    employee_id: string;
    full_name: string;
    project_name: string;
    imei: string;
    serial_number: string;
    device_mode: string;
    battery_status: string;
    battery_level: number;
    application_name: string;
    user_status: number;
    status_name: string;

    position?: string;
    car_plate?: string;

    constructor(
        latitude: number,
        longitude: number,
        firstname: string,
        lastname: string,
        phone: string,
        project_id: number,
        site_id: string,
        user_id: string,
        username: string,
        usertype: string,
        employee_id: string,
        full_name: string,
        project_name: string,
        imei: string,
        serial_number: string,
        device_mode: string,
        battery_status: string,
        battery_level: number,
        application_name: string,
        user_status: number,
        status_name: string,

        position?: string,
        car_plate?: string,
    ) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.firstname = firstname;
        this.lastname = lastname;
        this.phone = phone;
        this.project_id = project_id;
        this.site_id = site_id;
        this.user_id = user_id;
        this.username = username;
        this.usertype = usertype;
        this.employee_id = employee_id;
        this.full_name = full_name;
        this.project_name = project_name;
        // hhd-tracking
        this.imei = imei;
        this.serial_number = serial_number;
        this.device_mode = device_mode;
        this.battery_status = battery_status;
        this.battery_level = battery_level;
        this.application_name = application_name;
        this.user_status = user_status;
        this.status_name = status_name;

        this.position = position;
        this.car_plate = car_plate;
    }
}