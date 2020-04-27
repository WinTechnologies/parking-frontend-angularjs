import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { CurrentUserService } from '../../../services/current-user.service';
import { PgProjectsService } from '../../projects/services/projects.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-enforcement-groups',
  templateUrl: './enforcement-groups.component.html',
  styleUrls: ['./enforcement-groups.component.scss']
})

export class EnforcementGroupsComponent implements OnInit, OnDestroy {
  @Input() projectId;
  @Input() currentUser: any;
  // Permission Feature
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  ngUnsubscribe: Subject<void> = new Subject<void>();
  projectIdChanged = false;
  groupId: number;
  isCreate: boolean;
  focusGroup: any;

  constructor(private readonly pgProjectService: PgProjectsService) {
  }

  ngOnInit() {
    this.permission = CurrentUserService.canFeature(this.currentUser, 'tariff_enforcement_group');
    this.pgProjectService.projectObserable
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(projectId => {
        this.projectIdChanged = true;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onActivate({ projectId, currentUser, isAssignments = false }) {
    console.log('EnforcementGroups onActivate():', projectId)
    if (projectId) {
      this.projectId = projectId;
    }
    if (currentUser) {
      this.currentUser = currentUser;
    }
    this.projectIdChanged = true;
  }

  setGroupId(value) {
    this.groupId = value.groupId;
    this.projectIdChanged = false;
  }

  onUpdateStatus(value) {
    this.isCreate = value.isCreate;
    this.groupId = value.groupId;
    this.focusGroup = value.focusGroup;
    this.projectIdChanged = false;
  }
}
