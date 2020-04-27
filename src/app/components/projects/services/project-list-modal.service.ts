import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ProjectListModalComponent } from '../project-list/project-list-modal/project-list-modal.component';

@Injectable()
export class ProjectListModalService {

  constructor(
    private readonly dialog: MatDialog,
  ) { }

  show(projects) {
    return this.dialog.open(
      ProjectListModalComponent, {
        width: '80%',
        data: {
          projects
        }
      }
    );
  }
}