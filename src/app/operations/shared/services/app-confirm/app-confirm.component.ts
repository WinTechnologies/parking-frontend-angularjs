import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm',
  template: `<h1 mat-dialog-title>{{ data.title | translate }}</h1>
    <div mat-dialog-content>
      <div>
        <mat-form-field [style.width]="'100%'">
        <textarea
          matInput
          *ngIf="data.canInput"
          [(ngModel)]="input"
          [placeholder]="data.placeholder | translate">
        </textarea>
        </mat-form-field>
      </div>
      <p class="text-18 text-center">{{ data.message | translate }}</p>
    </div>
    <div mat-dialog-actions class="p-1">
      <button 
        type="button" 
        mat-raised-button
        color="primary" 
        (click)="close(true)">
          OK
      </button>    &nbsp;
      <span fxFlex></span>
      <button 
        type="button"
        color="accent"
        mat-raised-button 
        (click)="close(false)">
          Cancel
      </button>
    </div>`,
})
export class AppConfirmComponent {
  input = '';

  constructor(
    public dialogRef: MatDialogRef<AppConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public close(isOk = false) {
    if ((this.input && isOk) || !isOk) {
      this.dialogRef.close({
        result: isOk,
        input: this.input,
      });
    }
  }
}
