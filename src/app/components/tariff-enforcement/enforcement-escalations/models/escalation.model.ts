export class Escalation {
  id: any;
  escalation_name: string;
  outstanding_violation_nbr: number;
  outstanding_violation_tow: boolean;
  outstanding_violation_clamp: boolean;
  outstanding_days_nbr: number;
  outstanding_days_tow: boolean;
  outstanding_days_clamp: boolean;
  logical_rule: string;
  fee_tow: number;
  fee_clamp: number;
  storage_fee: number;
  storage_fee_unit: string;
  storage_max: number;
  storage_max_unit: string;
  applied_immediately: boolean;
  applied_after: number;
  project_id: number;
  applied_after_unit: string;
  zones: number[];
  created_at: Date;

  constructor() {
  }
}
