import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProjectActivityItem, globalProjectActivities } from '../../../models/project.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activity-new',
  templateUrl: './activity-new.component.html',
  styleUrls: ['./activity-new.component.scss']
})

export class ActivityNewComponent implements OnInit {
  activities: ProjectActivityItem[] = globalProjectActivities.slice(0);
  selectedOptions: any;

  constructor(
    public dialogRef: MatDialogRef<ActivityNewComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedOptions = data;
  }

  ngOnInit() { }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public onAdd(): void {
    this.dialogRef.close(this.selectedOptions);
  }
}