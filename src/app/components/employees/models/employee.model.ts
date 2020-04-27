export class Employee {
  address: string;
  date_end: string;
  date_start: string;
  day_of_birth: string;
  department: string;
  email: string;
  employee_id: string;
  firstname: string;
  lastname: string;
  id: number;
  img_url: string;
  job_position: string;
  landline: string;
  phone_number: string;
  sex: number;
  username: string;
  marital_status: string;
  password: string;
  working_status: string;
  project_name: string;
  job_type?: string;
  created_at?: string;
  created_by?: string;
}

export class EmployeeWp {
  id: number;
  employee_id: string;
  workplan_id: number;
  wp_exception_id: string;  // {exception_id1, exception_id2, ...}
  wp_reoccuring_id: string; // {reoccuring_id1, reoccuring_id2, ...}
  created_at: string;
}

