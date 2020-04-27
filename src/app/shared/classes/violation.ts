export class Violation {
    id:string;
    name_ar: string;
    name_en:string;
    decision: string;
    project_id: number;
    isactive: boolean;
    site_id: string;
    site_name: string;
    zones: any[];
    icon_path: string;

    observation_time: number;

    constructor(values: Object = {})
      {
        Object.assign(this, values);
    }
}
