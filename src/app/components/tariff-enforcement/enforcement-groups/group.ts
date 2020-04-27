export interface Group {
    id: number;
    group_name: string;
    created_at: string;
    date_start: string;
    date_end: string;
    working_days: any;
    working_timeslot: string;
    project_id: number | string;
}
