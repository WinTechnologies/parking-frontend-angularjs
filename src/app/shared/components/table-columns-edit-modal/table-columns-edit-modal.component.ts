import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-table-columns-edit-modal',
  templateUrl: './table-columns-edit-modal.component.html',
  styleUrls: ['./table-columns-edit-modal.component.scss']
})
export class TableColumnsEditModalComponent implements OnInit {
  columns = [];
  columnsOrigin: any = [];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  constructor(
    public dialogRef: MatDialogRef<TableColumnsEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.columns = data.showFields;
    this.columns.forEach(field => {
      this.columnsOrigin.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });
  }

  ngOnInit() {

  }

  onShowFlag(index, flag) {
    this.columns[index].isShow = flag;
  }

  onSave() {
    this.dialogRef.close(this.columns);
  }

  onCancel() {
    this.dialogRef.close(this.columnsOrigin);
  }

  onUp(index) {
    if (index > 0) {
      moveItemInArray(this.columns, index, index - 1);
    }
  }

  onDown(index) {
    if (index < this.columns.length - 1) {
      moveItemInArray(this.columns, index, index + 1);
    }
  }

  onReset() {
    this.columns = [];
    this.data.originFields.forEach(field => {
      this.columns.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });
  }
}
