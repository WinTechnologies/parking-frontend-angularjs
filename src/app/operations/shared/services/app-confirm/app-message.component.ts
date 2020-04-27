import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm',
  template: `
    <div fxLayout="row">
      <mat-icon class="mr-1">error</mat-icon>
      <h1 matDialogTitle>{{ data.title }}</h1>
    </div>
    <div mat-dialog-content>{{ data.message }}</div>`,
  styles: [
    'mat-icon, h1, div { color: orange; }',
    'mat-icon, h1 { line-height: 24px; }',
  ]
})
export class AppMessageComponent {
  type: string;
  color: string;

  constructor(
    public dialogRef: MatDialogRef<AppMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any
  ) {
    this.type = data.msgType;
    switch (data.msgType) {
      case 'error':
        this.color = 'red';
        break;

      case 'warning':
        this.type = 'orange';
        break;

      case 'info':
        this.type = 'blue';
        break;
    }
  }
}
