import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { GroupService } from '../../../../services/group.service';
import { CurrentUserService } from '../../../../services/current-user.service';
import { AlertdialogComponent } from '../../../alertdialog/alertdialog.component';
import { LoaderService } from '../../../../services/loader.service';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.component.html',
  styleUrls: ['./list-groups.component.scss']
})

export class ListGroupsComponent implements OnInit {
  @Input() set project_id(value) {
    this._project_id = value;
    this.getGroups(value);
  }

  @Output() groupId = new EventEmitter();
  @Output() updateGroupStatus = new EventEmitter();
  @Input() focusGroup: any;
  ngUnsubscribe: Subject<void> = new Subject<void>();

  _project_id;
  groups: any;
  originGroups: any;
  group_id;
  selected_group_id;
  isCreate: boolean;
  isCreateAssign: boolean;
  searchText;

  arrangeFields = [
    {label: 'Name a-z', fieldName: 'group_name'},
    {label: 'Valid date', fieldName: 'date_end'},
    {label: 'Date create', fieldName: 'created_at'}
  ];
  viewFilters = ['All', 'Expired', 'Available', 'Future'];
  selectedView: string;
  today: any;

  @Input() permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false
  };

  constructor(
    public dialog: MatDialog,
    private groupService: GroupService,
    private loaderService: LoaderService,
    private toastrService: ToastrService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);
  }

  onChangeGroup(value) {
    this.selected_group_id = value;
  }

  /**
   * change format data for form
   */
  updateGroupData() {
    this.groups.map(group => {
      group.created_at = new Date(group.created_at);
      group.date_start = new Date(group.date_start).toString().substring(4, 15);
      if (group.date_end) {
        group.date_end = new Date(group.date_end).toString().substring(4, 15);
      }

      if (group.working_timeslot) {
        group.working_timeslot = group.working_timeslot.split(',');
      }

      const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      if (group.working_days) {
        const working_days = group.working_days.split(',');
        group.working_days = weekDays.map(day => {
          if (working_days.includes(day)) {
            return { name: day, isSelected: true };
          } else {
            return { name: day, isSelected: false };
          }
        });
      } else {
        group.working_days = weekDays.map(day => {
          return { name: day, isSelected: false };
        });
      }
    });
  }

  /**
   * get list of groups
   * @param project_id
   */
  getGroups(project_id) {
    this.groupService
      .getGroups(project_id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        this.groups = result;
        this.originGroups = [...this.groups];
        this.updateGroupData();
      });
  }

  /**
   * handler for clicking on the group
   * @param group
   */
  viewDetails(group) {
    if (!this.permission.isUpdate) {
      this.currentUserService.showNotAccessToastr();
      return;
    }
    this.updateGroupStatus.emit({
      isCreate: false,
      groupId: group.id
    });
  }

  /**
   * handler for clicking on the delete button on the group
   * @param group
   */
  onDelete(group) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loaderService.enable();
        this.groupService.deleteGroup(group.id)
          .subscribe(res => {
           this.getGroups(this._project_id);
            this.toastrService.success(
              'The group is deleted successfully!',
              'Success!'
            );
            this.loaderService.disable();
        });
      }
    });
  }

  /**
   * handler add new group
   */
  onAdd() {
    if (this.selected_group_id) {
      this.updateGroupStatus.emit({
        isCreate: true,
        groupId: this.selected_group_id
      });
    } else {
      this.updateGroupStatus.emit({
        isCreate: true
      });
    }
  }

  arrangeByField(fieldName) {
    this.groups.sort((groupA, groupB) => {
      let compareA, compareB;
      if (fieldName === 'group_name') {
        compareA = groupA[fieldName].toLowerCase();
        compareB = groupB[fieldName].toLowerCase();
      } else {
        compareA = new Date(groupA[fieldName]);
        compareB = new Date(groupB[fieldName]);
      }

      if (compareA < compareB) {
        return -1;
      }
      if (compareA > compareB) {
        return 1;
      }
      return 0;
    });

    this.groups = this.groups.slice(0);
  }

  public filterPromotions() {
    const view = !this.selectedView ? 'All' : this.selectedView;
    switch (view) {
      case 'All':
        this.groups = this.originGroups.slice(0);
        return;
      case 'Available':
        this.groups = this.originGroups.filter(group => {
          if ( ( new Date(group.date_start) <= this.today && (!group.date_end || new Date(group.date_end) >= this.today) ) ) {
            return group;
          }
        });
        return;
      case 'Expired':
        this.groups = this.originGroups.filter(group => (new Date(group.date_end) < this.today && group.date_end));
        return;
      case 'Future':
        this.groups = this.originGroups.filter(group => new Date(group.date_start) > this.today);
        return;
      default:
        this.groups = this.originGroups.slice(0);
        return;
    }
  }

  checkExpired(group) {
    return !!group.date_end && new Date(group.date_end) < this.today;
  }
}
