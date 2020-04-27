import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CurrentUserService } from '../../../../services/current-user.service';
import { LoaderService } from '../../../../services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { AssignmentService } from '../../services/assignment.service';
import { globalProjectActivities, ProjectActivityItem } from '../../../../components/projects/models/project.model';

@Component({
  selector: 'app-assignment-list',
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.scss']
})
export class AssignmentListComponent implements OnInit {

  filteredProjects: any[] = [];
  originProjects: any[];
  activityTypes: ProjectActivityItem[] = globalProjectActivities.slice(0);

  // Permission Feature
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  constructor(
    private location: Location,
    private currentUserService: CurrentUserService,
    private loaderService: LoaderService,
    private toastrService: ToastrService,
    private assignmentService: AssignmentService,
  ) { }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      this.originProjects = await this.assignmentService.getProjects();
      this.filteredProjects = this.originProjects.slice(0);
    } catch (e) {
      this.toastrService.error(e.message ? e.message : 'Something went wrong', 'Error');
    } finally {
      this.loaderService.disable();
    }
  }

  applyFilter(filter) {
    filter = filter.trim().toLowerCase();
    this.filteredProjects = this.originProjects.filter( project => {
      return project.project_name.toLowerCase().includes(filter) || project.project_code.toLowerCase().includes(filter);
    });
  }

}
