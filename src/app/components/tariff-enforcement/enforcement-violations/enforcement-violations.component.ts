import { Component, OnInit, Inject, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PgProjectsService } from '../../projects/services/projects.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { ViolationService } from '../../../services/violation.service';
import { GroupService } from '../../../services/group.service';
import { ToastrService } from 'ngx-toastr';

import { MatDialog } from '@angular/material';
import { ViolationDetailsDialogComponent } from './violation-details-dialog/violation-details-dialog.component';
import { AlertdialogComponent } from '../../alertdialog/alertdialog.component';
import { TableColumnsEditModalComponent } from '../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-enforcement-violations',
  templateUrl: './enforcement-violations.component.html',
  styleUrls: ['./enforcement-violations.component.scss']
})

export class EnforcementViolationsComponent implements OnInit, OnChanges, OnDestroy {

  private _projectId;
  @Input() set projectId(value) {
    this._projectId = value;
  }
  get projectId() {
    return this._projectId;
  }
  @Input() isAssignments: boolean;
  @Input() assignmentId: number;
  @Input() groupId;
  @Input() zones;
  @Input() isPopup: boolean;
  @Input() currentUser: any;

  @Output() selectViolation = new EventEmitter();
  @Output() highlighted = new EventEmitter();

  // Permission Feature
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: true,
  };

  ngUnsubscribe: Subject<void> = new Subject<void>();
  results_count: number;
  baseUrl: string = this.apiEndpoint;
  displayedColumns = [
      {name: 'icon_url', label: 'Picture', isShow: true},
      {name: 'violation_code', label: 'Code', isShow: true},
      {name: 'violation_name_en', label: 'Violation Name', isShow: true},
      {name: 'is_nonpayment', label: 'Non-payment type', isShow: true}
    ];
  tableFields: any = [];
  showFields = [];
  dataSource: any = [];
  dataSourceOrigin: any = [];
  rowHeight = 70;
  violation;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly pgProjectsService: PgProjectsService,
    private readonly violationService: ViolationService,
    private readonly groupService: GroupService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  ngOnInit() {
    const permission = CurrentUserService.canFeature(this.currentUser, 'tariff_enforcement_violation');
    if (permission.isCreate || permission.isUpdate || permission.isDelete) {
      this.permission = permission;
    }

    if (this.isPopup) {
      this.displayedColumns = [
        {name: 'icon_url', label: 'Picture', isShow: true},
        {name: 'violation_code', label: 'Code', isShow: true},
        {name: 'is_nonpayment', label: 'Non-payment type', isShow: true},
        {name: 'violation_name_en', label: 'Violation Name', isShow: true}
      ];
      this.rowHeight = 70;
    } else if (this.isAssignments) {
      this.displayedColumns = [
        {name: 'icon_url', label: 'Picture', isShow: true},
        {name: 'violation_code', label: 'Code', isShow: true},
        {name: 'violation_name_en', label: 'Violation Name', isShow: true},
        {name: 'is_nonpayment', label: 'Non-payment type', isShow: true},
        {name: 'project_name', label: 'Project Name', isShow: true},
        {name: 'value', label: 'Fee', isShow: true},
        {name: 'assignment_action', label: 'Action', isShow: true},
        {name: 'assignment_status', label: 'Status', isShow: true},
        {name: 'service_fee', label: 'Service Fee', isShow: true},
        {name: 'schedule', label: 'Schedule', isShow: true},
        {name: 'can_delete', label: 'Remove', isShow: true}
      ];
      this.rowHeight = 150;
    }

    if (this.permission.isDelete && !this.isPopup && !this.isAssignments) {
      this.displayedColumns.push({name: 'action', label: 'Remove', isShow: true});
    }

    this.displayedColumns.forEach(field => {
      this.showFields.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });
    this.tableFields = this.showFields;

    this.pgProjectsService.projectObserable
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(projectId => {
        this.onActivate({
          projectId: projectId,
          currentUser: this.currentUser,
          isAssignments: this.isAssignments,
        });
      });
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        console.log('Child Component: activatedRoute.snapshot: ', this.activatedRoute.snapshot)
        if (params.operation === 'create') {
          this.onAdd();
        } else if (params.operation) {
          // TODO:
        }
      });
  }

  ngOnChanges(changes): void {
    if (!this.isAssignments && changes.projectId) {
      this.getViolations();
    } else if (changes.isAssignments) {
      this.getViolations();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onActivate({ projectId, currentUser, isAssignments = false}) {
    console.log('EnforcementViolation onActivate():', projectId)
    if (projectId) {
      this.projectId = projectId;
    }
    if (isAssignments) {
      this.isAssignments = isAssignments;
    }
    if (currentUser) {
      this.currentUser = currentUser;
    }
    this.getViolations();
  }

  selectingViolation(violation) {
    this.selectViolation.emit(violation);
  }

  private fetchMatTable(violations): void {
    this.dataSource = violations;
    this.dataSourceOrigin = violations;
  }

  public editColumns() {
    const dialogRef = this.dialog.open(TableColumnsEditModalComponent, {
      width: '550px',
      data : {
        showFields: this.showFields,
        originFields: this.displayedColumns,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showFields = result;
        this.tableFields = this.showFields.filter(field => field.isShow);
      }
    });
  }

  public reorderColumns(event) {
    const newValue = this.tableFields[event.newValue];
    const prevValue = this.tableFields[event.prevValue];
    const newIndex = this.showFields.indexOf(newValue);
    const prevIndex = this.showFields.indexOf(prevValue);
    let i = 0 ;
    this.showFields = this.showFields.map(value => {
      value = i === newIndex ? prevValue : value;
      value = i === prevIndex ? newValue : value;
      i++;
      return value;
    });
    this.tableFields = this.showFields.filter(field => field.isShow);
  }

  public applyFilterEmployee(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.dataSourceOrigin) {
      this.dataSource = this.dataSourceOrigin.filter(row => {
        let bRet = true;
        let cRet = false;
        this.tableFields.forEach(value => {
          if (row[value.name]) {
            cRet = cRet || (row[value.name].toString().toLowerCase().indexOf(filterValue) >= 0);
          }
        });
        bRet = bRet && cRet;
        return bRet;
      });
    }
  }

  getViolations(): void {
    if (this.projectId && this.isAssignments && this.groupId) {
      this.groupService.getAssignments(this.projectId, this.groupId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(violations => {
          if (violations) {
            this.results_count = violations.length;
            this.fetchMatTable(violations);
          }
        });
    } else if (this.projectId) {
      this.violationService.getViolationsByProjectId(this._projectId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(violations => {
          if (violations) {
            this.results_count = violations.length;
            this.fetchMatTable(violations);
          }
        });
    }
  }

  onAdd() {
    const dialogRef = this.dialog.open(ViolationDetailsDialogComponent, {
      width : '60%',
      data: {
        canUpdate: this.permission.isCreate,
        projectId: this.projectId,
        create: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getViolations();
    });
  }

  highlightViolation = (row) => {
    const rowIndex = this.dataSource.indexOf(row);
    if (
      (this.assignmentId === 0 && (this.dataSource.length - 1) === rowIndex)
      || (typeof row.assignment_id !== 'undefined') && row.assignment_id === this.assignmentId
    ) {
      return { highlighted: true };
    } else {
      return '';
    }
  }

  public onSelect(event) {
    if (event.type === 'click') {
      if (this.isPopup || this.isAssignments) {
        this.selectingViolation(event.row);
      } else if (!this.isAssignments) {
        event.rowElement.className = event.rowElement.className + ' selectedRow';
        const dialogRef = this.dialog.open(ViolationDetailsDialogComponent, {
          width : '60%',
          data: {
            id: event.row.id,
            canUpdate: this.permission.isUpdate,
            projectId: this.projectId,
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          this.getViolations();
          $('.datatable-body-row.selectedRow').removeClass('selectedRow');
        });
      }
    }
  }

  public onDelete(violation: any) {
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
      if (result) {
        if (this.groupId) {
          this.groupService.deleteAssignmentById(violation.assignment_id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.toastrService.success('The assignment is deleted successfully!', 'Success!');
              dialogRef.close();
              this.getViolations();
            });
        } else {
          this.violationService.deleteViolation(violation.id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.toastrService.success('The violation is deleted successfully!', 'Success!');
              dialogRef.close();
              this.getViolations();
            });
        }
      }
    });
  }
}
