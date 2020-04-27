import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GroupDetailsComponent } from '../group-details/group-details.component';

@Component({
  selector: 'app-popup-violations',
  templateUrl: './popup-violations.component.html',
  styleUrls: ['./popup-violations.component.scss']
})

export class PopupViolationsComponent implements OnInit {
  project_id;
  groupId: string;

  constructor(
    public dialogRef: MatDialogRef<GroupDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit() {
    this.project_id = this.data.project_id;
    this.groupId = this.data.groupId;
  }

  selectingViolation(event) {
    this.dialogRef.close(event);
  }
}