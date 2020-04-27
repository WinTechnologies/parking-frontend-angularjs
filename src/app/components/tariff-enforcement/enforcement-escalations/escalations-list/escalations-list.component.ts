import { Component, OnInit, Input, OnChanges, SimpleChanges, Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PgEscalationService } from '../services/escalation.service';
import { PgProjectsService } from '../../../projects/services/projects.service';
import { CurrentUserService } from '../../../../services/current-user.service';
import { ToastrService } from 'ngx-toastr';
import { Escalation } from '../models/escalation.model';
import { MatDialog } from '@angular/material';
import { EscalationsNewDialogComponent } from '../escalations-new-dialog/escalations-new-dialog.component';
import { AlertdialogComponent } from '../../../alertdialog/alertdialog.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-escalations-list',
  templateUrl: './escalations-list.component.html',
  styleUrls: ['./escalations-list.component.scss']
})

export class EscalationsListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectId: number;
  @Input() currentUser: any;
  // Permission Feature
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  ngUnsubscribe: Subject<void> = new Subject<void>();
  escalations: Escalation[] = [];
  filteredEscalations: Escalation[] = [];
  filter = '';
  selectedEscalation: Escalation;

  constructor(
    private readonly pgProjectsService: PgProjectsService,
    private readonly escalationService: PgEscalationService,
    private readonly currentUserService: CurrentUserService,
    private readonly toastr: ToastrService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly dialog: MatDialog,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  ngOnInit() {
    this.permission = CurrentUserService.canFeature(this.currentUser, 'tariff_enforcement_escalation');
    this.pgProjectsService.projectObserable
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(projectId => {
        this.onActivate({
          projectId: projectId,
          currentUser: this.currentUser,
        });
      });


    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        console.log('Child Component: activatedRoute.snapshot: ', this.activatedRoute.snapshot)
        if (params.operation === 'create') {
          this.onAddEscalation();
        } else if (params.operation) {
          // TODO:
        }
      });
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.projectId) {
      this.getEscalations();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onActivate({ projectId, currentUser, isAssignments = false }) {
    console.log('EnforcementEscalationList onActivate():', projectId)
    if (projectId) {
      this.projectId = projectId;
    }
    if (currentUser) {
      this.currentUser = currentUser;
    }
    this.getEscalations();
  }

  private getEscalations() {
    if (this.projectId) {
      this.escalationService.get({ project_id: this.projectId })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe( res => {
          this.escalations = res;
          this.applyFilterEscalations(this.filter);
        });
    }
  }

  public applyFilterEscalations(filter: string) {
    filter = filter.trim().toLowerCase();
    this.filter = filter;
    this.filteredEscalations = this.escalations.filter( v => {
      return v.escalation_name.toLocaleLowerCase().indexOf(this.filter) >= 0;
    }).sort((a: Escalation, b: Escalation) => {
      const aDate = new Date(a.created_at);
      const bDate = new Date(b.created_at);
      return aDate < bDate ? 1 : -1;
    });
  }

  public onAddEscalation() {
    this.openDialog();
  }

  private openDialog(escalation = new Escalation()) {
    const dialogRef = this.dialog.open(EscalationsNewDialogComponent, {
      width: '90%',
      data: {
        projectId: this.projectId,
        escalation: escalation
      }
    });

    dialogRef.afterClosed().subscribe(status => {
      this.selectedEscalation = new Escalation();
      if (status !== 'close') {
        this.getEscalations();
      }
    });
  }

  public onEdit(escalation: Escalation) {
    if (!this.permission.isUpdate) {
      this.currentUserService.showNotAccessToastr();
      return;
    }
    this.openDialog(escalation);
  }

  public onRemove(escalation: Escalation) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete ?',
        btnOk: 'OK',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.escalationService.delete(escalation.id).subscribe(res => {
          this.toastr.success(
            'The Escalation is deleted successfully!',
            'Success!'
          );
          this.getEscalations();
        });
      }
    });
  }
}
