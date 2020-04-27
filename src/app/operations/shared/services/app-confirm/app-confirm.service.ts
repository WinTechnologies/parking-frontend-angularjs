import { Observable } from 'rxjs';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Injectable } from '@angular/core';

import { AppConfirmComponent } from './app-confirm.component';
import { AppMessageComponent } from './app-message.component';

interface PopupData {
  type?: string;
  title?: string;
  message?: string;
  canInput?: boolean;
  /* available only when canInput is true */
  placeholder?: string;
}

@Injectable()
export class AppConfirmService {

  constructor(private dialog: MatDialog) { }

  public confirm(data: PopupData = {}): Observable<any> {
    data.title = data.title || 'Confirm';
    data.message = data.message || 'Are you sure?';
    data.canInput = data.canInput || false;
    let dialogRef: MatDialogRef<AppConfirmComponent>;
    dialogRef = this.dialog.open(AppConfirmComponent, {
      width: data.canInput ? '800px' : '380px',
      disableClose: true,
      data,
    });
    return dialogRef.afterClosed();
  }

  public message(data: PopupData = {}): Observable<boolean> {
    data.title = data.title || 'Confirm';
    data.message = data.message || 'Are you sure?';
    data.canInput = data.canInput || false;
    let dialogRef: MatDialogRef<AppMessageComponent>;
    dialogRef = this.dialog.open(AppMessageComponent, {
      width: data.canInput ? '800px' : '380px',
      disableClose: false,
      data,
    });
    return dialogRef.afterClosed();
  }
}
