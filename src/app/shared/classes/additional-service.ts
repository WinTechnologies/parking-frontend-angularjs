export interface AdditionalServiceDetail {
  amount: number;
  service: {
    id: number;
    name: string;
    amount: number;
  }[];
}

export class ServiceDetailHandler {
  static transformInitData(params: { amount: string, service: any[] }): AdditionalServiceDetail {
    const services: AdditionalServiceDetail = {
      amount: 0,
      service: [],
    };
    services.amount = parseFloat(params.amount);
    services.service = params.service.map(({id, name, amount}) => {
      return {
        id: typeof id !== 'number' ? parseInt(id, 10) : id,
        name: name,
        amount: typeof amount !== 'number' ? parseFloat(amount) : amount,
      };
    });
    return services;
  }
}

export class Service {
  id: number;
  // ticket_number: string;
  // service_id: number;
  service_name_en: string;
  service_name_ar: string;
  // service_fee: number;
  fee: number;
  operation_type: string;
  selected?: boolean;

  payment_type_code?: string;
  description?: string;
  working_days?: string;
  working_timeslot?: string;
  image_url?: string;
  term_conditions?: string;
  date_created?: string | Date;
}
