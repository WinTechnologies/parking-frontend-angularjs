export class EscalationRule {
    id: string;
    site_id: string;
    project_id: number;
    site_name: string;
    number_cn: number;
    number_days: number[];
    increment_amount: string[];
    job_type: string;
    zones: any[];

    constructor(id: string = '', site_id: string = '', project_id: number = null,
                site_name: string = '', number_cn: number = -1,
                number_days: number[] = [], increment_amount: string[] = [], job_type: string = '', zones: any[] = [])
      // tslint:disable-next-line:one-line
      {
        this.id = id;
        this.site_id = site_id;
        this.project_id = project_id;
        this.site_name = site_name;
        this.number_cn = number_cn;
        this.number_days = number_days;
        this.increment_amount = increment_amount;
        this.job_type = job_type;
        this.zones = zones;
    }
}
