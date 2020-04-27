import { Exception } from '../workplan-new/exceptions/models/exceptions.model';
import { Reoccuring } from '../workplan-new/reoccurings/models/reoccurings.model';

export class Workplan {
  id: number;
  wp_name: string;
  location: string;
  country_code: string;
  description: string;
  date_start: string | Date;
  date_end: string | Date;
  created_at: string | Date;
  deleted_at: string | Date;
  deleted_by: string;
  reoccurings: Reoccuring[];
  exceptions: Exception[];

  constructor(workplan: {
                wp_name?: string,
                location?: string,
                country_code?: string,
                description?: string,
                date_start?: string | Date,
                date_end?: string | Date,
              },
              reoccurings = [],
              exceptions = []
  ) {
    this.wp_name = workplan.wp_name;
    this.location = workplan.location;
    this.country_code = workplan.country_code;
    this.description = workplan.description;
    this.date_start = workplan.date_start;
    this.date_end = workplan.date_end;
    this.reoccurings = reoccurings;
    this.exceptions = exceptions;
  }
}