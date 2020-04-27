import {Component, OnInit} from '@angular/core';
import {EnforcementItem, EnforcementType, gEnforcementItems} from '../models/enforcement.model';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {PgProjectsService} from '../../../../components/projects/services/projects.service';
import {Project} from '../../../../components/projects/models/project.model';

@Component({
  selector: 'app-enforcement',
  templateUrl: './enforcement.component.html',
  styleUrls: ['./enforcement.component.scss']
})
export class EnforcementComponent implements OnInit {

  types = gEnforcementItems;
  selectedType: EnforcementItem = gEnforcementItems[0];
  EnforcementType = EnforcementType;
  projectId: number;
  project: Project;

  constructor(
    private readonly location: Location,
    private route: ActivatedRoute,
    private readonly projectService: PgProjectsService
  ) {
    this.route.params.subscribe(params => {
      if (params['projectId']) {
        this.projectId = params['projectId'];
        this.projectService.getProjectById(this.projectId)
          .subscribe(project => {
            this.project = project;
          });
      }
    });
  }

  ngOnInit() {
  }

  public onSelectType(type: EnforcementItem) {
    this.selectedType = type;
  }

  public onBack() {
    this.location.back();
  }
}
