export class PgActEnforcementIncentive {
  id?: string;
  project_id: number;
  job_position: string;
  incentive_category: string;
  incentive_name: string;
  workplan: any;
  incentive_type: string;
  option: string;
  incentive_unity: string;
  calculation_type: string;
  manager_type?: string;

  constructor(project_id: number, job_position: string, incentive_category: string,
              incentive_name: string, workplan: any, incentive_type: string, option: string, incentive_unity: string,
              calculation_type: string, manager_type: string, id?: string) {
    this.project_id = project_id;
    this.job_position = job_position;
    this.incentive_category = incentive_category;
    this.incentive_name = incentive_name;
    this.workplan = workplan;
    this.incentive_type = incentive_type;
    this.option = option;
    this.incentive_unity = incentive_unity;
    this.calculation_type = calculation_type;

    if (manager_type) {
      this.manager_type = manager_type;
    }

    if (id) {
      this.id = id;
    }
  }
}