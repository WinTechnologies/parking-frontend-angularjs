import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { AssignmentService } from '../../services/assignment.service';
import { LoaderService } from '../../../../services/loader.service';
import { CurrentUserService } from '../../../../services/current-user.service';

@Component({
  selector: 'app-assignment-detail',
  templateUrl: './assignment-detail.component.html',
  styleUrls: ['./assignment-detail.component.scss']
})
export class AssignmentDetailComponent implements OnInit {

  projectId: number;

  project: any;
  assignedEmployees: any[] = [];
  selectedTab: number;
  employeesCount: number;
  // Permission Feature
  currentUser: any;
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private loaderService: LoaderService,
    private currentUserService: CurrentUserService,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.projectId = +params['id'];
    });
  }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      if (this.projectId) {
        const promises = [
          this.assignmentService.getProject(this.projectId),
          this.currentUserService.get()
        ];
        const [projects, currentUser] = await Promise.all(promises);
        this.permission = CurrentUserService.canFeature(currentUser, 'hr_assignment');
        this.project = projects[0];
      }
    } finally {
      this.loaderService.disable();
    }
  }

  goBack() {
    this.location.back();
  }

  onSwitchTab(tabIndex: number): void {
    this.selectedTab = tabIndex;
  }

  onEmployeesCount(employeesCount: number) {
    this.employeesCount = employeesCount;
  }
}
