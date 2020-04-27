export class Reoccuring {
  id: number;
  reoccuring_name: string;
  workplan_id: string;
  working_days: string;
  timeslot_working: string;
  date_start: string | Date;
  date_end: string | Date;
  created_at: string;
  deleted_by: string;
  deleted_at: string;

  constructor() {
    this.timeslot_working = '00:00-23:59';
  }
}
