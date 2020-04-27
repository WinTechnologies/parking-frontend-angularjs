import { Injectable } from '@angular/core';
import { PermissionEmployeesModalComponent } from '../components/permission-template-detail/permission-employees-modal/permission-employees-modal.component';
import { MatDialog } from '@angular/material';

@Injectable()
export class PermissionEmployeesModalService {

  constructor(
    private readonly dialog: MatDialog,
  ) { }

  show(data) {
    return this.dialog.open(
      PermissionEmployeesModalComponent, {
        width: '80%',
        data: {...data}
      }
    );
  }
}