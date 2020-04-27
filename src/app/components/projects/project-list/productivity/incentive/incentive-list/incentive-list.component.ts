import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IncentiveDialogComponent } from '../incentive-dialog/incentive-dialog.component';
import { MatDialog } from '@angular/material';
import { DialogData } from '../incentive-dialog/models/dialog-data.model';
import { Project } from '../../../../models/project.model';
import { AlertdialogComponent } from '../../../../../alertdialog/alertdialog.component';
import { PgActEnforcementIncentive } from '../models/act-enforcement-incentive.model';
import { PgActEnforcementIncentiveService } from '../services/act-enforcement-incentive.service';
import { ToastrService } from 'ngx-toastr';
import { PgActEnforcementIncentiveBandService } from "../incentive-dialog/service/act-enforcement-incentive-band.service";
import { CurrentUserService } from '../../../../../../services/current-user.service';

@Component({
  selector: 'app-incentive-list',
  templateUrl: './incentive-list.component.html',
  styleUrls: ['./incentive-list.component.scss']
})

export class IncentiveListComponent implements OnInit, OnChanges{
  @Input() project: Project;
  @Input() incentive_category: string;
  @Input() job_position: string;
  @Input() label: string;
  @Input() canUpdate = false;

  incentives: PgActEnforcementIncentive[];

  constructor(public dialog: MatDialog,
              private actEnforcementIncentiveService: PgActEnforcementIncentiveService,
              private actEnforcementIncentiveBandService: PgActEnforcementIncentiveBandService,
              private toastrservice: ToastrService,
              private currentUserService: CurrentUserService,
              ) { }

  ngOnInit() {
    this.getListIncentive();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.job_position.previousValue) {
      this.getListIncentive();
    }
  }

  getListIncentive() {
    this.incentives = [];
    this.actEnforcementIncentiveService.get(this.project.id).subscribe(result => {
        result.forEach( x => {
          if (this.label === 'Incentives') {
            if (x.job_position === this.job_position &&
              x.incentive_category === this.incentive_category) {
              this.incentives.push(x);
            }
          } else {
            if (x.job_position === this.job_position &&
                x.incentive_category === this.incentive_category &&
                x.manager_type === this.label) {
              this.incentives.push(x);
            }
          }
        });
    }, err => {
    });
  }

  openDialog(functionality: string, selectedIndex: number = undefined): void {
    if (!this.canUpdate) {
      this.currentUserService.showNotAccessToastr();
      return;
    }
    const dialogRef = this.dialog.open(IncentiveDialogComponent, {
      width: '70%',
      data: new DialogData(this.project, this.job_position, this.incentive_category, this.label, functionality, this.incentives[selectedIndex])
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'ADD') {
        this.toastrservice.success('The incentive has been added successfully!', 'Success!');
        this.getListIncentive();
      }
      else if (result === 'UPDATE') {
        this.toastrservice.success('The incentive has been updated successfully!', 'Success!');
        this.getListIncentive();
      }
    });
  }

  onDelete(index: number) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete ?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actEnforcementIncentiveService.delete(this.incentives[index]).subscribe( res => {
        this.actEnforcementIncentiveBandService.deleteByIncentive(this.incentives[index].id).subscribe();
        this.getListIncentive();
        this.toastrservice.success('The incentive has been deleted successfully!', 'Success!');
      });
    }
    });
  }
}
