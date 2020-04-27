import {Project} from '../../../../../models/project.model';
import {PgActEnforcementIncentive} from '../../models/act-enforcement-incentive.model';

export class DialogData {
  project: Project;
  job_position: string;
  incentive_category: string;
  manager_type = '';
  functionality: string;
  incentive?: PgActEnforcementIncentive;

  constructor(project: Project, job_position: string, incentive_category: string, manager_type: string,
              functionality: string, incentive: PgActEnforcementIncentive) {
    this.project = project;
    this.job_position = job_position;
    this.incentive_category = incentive_category;
    if (manager_type !== 'Incentives') {
      this.manager_type = manager_type;
    }
    this.functionality = functionality;
    this.incentive = incentive;
  }
}