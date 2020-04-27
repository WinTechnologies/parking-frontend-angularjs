export class Employee {

    id: string;
    employee_id: string;
    firstname: string;
    lastname: string;
    phone_number: string;
    job_position: string;
    address: string;
    department: string;
    landline: string;
    email: string;
    sex: string;
    day_of_birth: string;
    date_start: string;
    date_end: string;
    supervisor_id: string;
    picture: string;

    constructor(id: string = '',
        employee_id: string = '',
        firstname: string = '',
        lastname: string = '',
        phone_number: string = '',
        job_position: string = '',
        address: string = '',
        department: string = '',
        landline: string = '',
        email: string = '',
        sex: string = '',
        day_of_birth: string = '',
        date_start: string = '',
        date_end: string = '',
        supervisor_id: string = '',
        picture: string = ''
    ) {
        this.id = id;
        this.employee_id = employee_id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.phone_number = phone_number;
        this.job_position = job_position;
        this.address = address;
        this.department = department;
        this.landline = landline;
        this.email = email;
        this.sex = sex;
        this.day_of_birth = day_of_birth;
        this.date_start = date_start;
        this.date_end = date_end;
        this.supervisor_id = supervisor_id;
        this.picture = picture;
    }
}
