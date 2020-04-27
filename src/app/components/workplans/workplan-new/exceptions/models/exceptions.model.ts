export class Exception {
  id: string;
  workplan_id: string;
  exception_name: string;
  applied_dates: string;
  timeslot_working: string;
  is_holiday: boolean;
  created_at: string;
  deleted_by: string;
  deleted_at: string;

  constructor() {
    this.timeslot_working = '00:00-23:59';
  }
}