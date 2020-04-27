import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { Project } from '../../models/project.model';
import { PgActEnforcementIncentiveService } from './incentive/services/act-enforcement-incentive.service';
import { PgActEnforcementIncentive } from './incentive/models/act-enforcement-incentive.model';
import { ProjectActivity } from '../../models/project-activity.model';
import { PgProjectActivityService } from '../../services/project-activity.service';
import { CurrentUserService } from '../../../../services/current-user.service';
import { LoaderService } from '../../../../services/loader.service';

@Component({
  selector: 'app-productivity',
  templateUrl: './productivity.component.html',
  styleUrls: ['./productivity.component.scss']
})

export class ProductivityComponent implements OnInit {
  @Input() project: Project;

  // Permission Feature
  canUpdate = false;

  projectActivity: ProjectActivity;
  selected_activity: string;
  selected_job_position: string;

  // To display the list of incentive per job_position
  incentiveTitles: string[];

  incentives: PgActEnforcementIncentive[];
  job_positions = [
    {
      'name': 'Tow Truck',
      'iconPath': 'assets/Icons/Projects_section/Project list/tow truck.svg'
    },
    {
      'name': 'Clamp Van',
      'iconPath': 'assets/Icons/Projects_section/Project list/clamp van.svg'
    },
    {
      'name': 'Driver',
      'iconPath': 'assets/Icons/Projects_section/Project list/driver.svg'
    },
    {
      'name': 'EOD',
      'iconPath': 'assets/Icons/Projects_section/Project list/EOD_icon.svg'
    },
    {
      'name': 'EO',
      'iconPath': 'assets/Icons/Projects_section/Project list/eo_hover.svg'
    },
    {
      'name': 'Supervisor',
      'iconPath': 'assets/Icons/Projects_section/Project list/supervisor.svg'
    },
    {
      'name': 'Manager',
      'iconPath': 'assets/Icons/Projects_section/Project list/manager.svg'
    }
  ];

  incentive_category: string[];
  incentiveCategoryTowTruck = ['Job', 'Deployment', 'Accidents'];
  incentiveCategorySupervisorManager = ['Issuance', 'Deployed'];
  incentiveCategoryOther = ['Issuance', 'Deployed', 'Accuracy'];

  constructor(
    private domSanitizer: DomSanitizer,
    public matIconRegistry: MatIconRegistry,
    private projectActivityService: PgProjectActivityService,
    private pgActEnforcementServive: PgActEnforcementIncentiveService,
    private currentUserService: CurrentUserService,
    private loaderService: LoaderService,
  ) {
    this.matIconRegistry.addSvgIcon('predictions', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/Project list/predictions.svg'));
    this.matIconRegistry.addSvgIcon('incentives', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/Icons/Projects_section/Project list/incentives.svg'));
  }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      const currentUser = await this.currentUserService.get();
      this.canUpdate = CurrentUserService.canUpdate(currentUser, 'project_productivity');
      this.getProjectActivity();
    } finally {
      this.loaderService.disable();
    }
  }

  /**
   * On click on the activity (sidebar)
   * @param activity
   */
  onClickActivity(activity: string) {
    this.selected_activity = '';
    this.selected_activity = activity;
  }

  /**
   * On click on job position (topbar of productivity)
   * @param job_position
   */
  onClickJobPosition(job_position: string) {
    this.selected_job_position = '';
    this.selected_job_position = job_position;
    this.getIncentiveCategory();
  }

  /**
   * To retrieve from the database the activity of the current project
   */
  getProjectActivity() {
    if (this.project.id) {
      this.projectActivityService.get({project_id: this.project.id}).subscribe(res => {
        if (res.length) {
          this.projectActivity = res[0];
        }
      });
    }
  }

  /**
   * To retrieve from the database the incentive category of the current project
   */
  getIncentiveCategory() {
    this.incentive_category = [];
    if (this.selected_job_position === 'Tow Truck' || this.selected_job_position === 'Clamp Van' || this.selected_job_position === 'Driver') {
      this.incentive_category = this.incentiveCategoryTowTruck;
      this.incentiveTitles = ['Incentives'];
    } else if (this.selected_job_position === 'Supervisor' || this.selected_job_position === 'Manager') {
      this.incentive_category = this.incentiveCategorySupervisorManager;
      this.incentiveTitles = ['EOs', 'TOWs', 'CLAMPs'];
    } else {
      this.incentive_category = this.incentiveCategoryOther;
      this.incentiveTitles = ['Incentives'];
    }
  }
}