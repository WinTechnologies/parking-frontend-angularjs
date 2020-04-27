export class Product {
    id?: string;
    name: string;
    client_type: string;
    price_type: string;
    begin_date: number;
    end_date: number;
    project_id: number;
    site_id: string;
    time_unit: string;
    time_segments: string;
    percent: number;
    payment_methods;


    constructor( id: string, name: string, client_type: string,
                price_type: string, begin_date: number, end_date: number,
                project_id: number, site_id: string, time_unit: string, time_segments: string,
                percent: number, payment_methods) {
        this.id = id;
        this.name = name;
        this.client_type = client_type;
        this.price_type = price_type;
        this.begin_date = begin_date;
        this.end_date = end_date;
        this.project_id = project_id;
        this.site_id = site_id;
        this.time_unit = time_unit;
        this.time_segments = time_segments;
        this.percent = percent;
        this.payment_methods = payment_methods;
    }
}
