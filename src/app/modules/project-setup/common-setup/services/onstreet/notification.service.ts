import { Injectable } from '@angular/core';
import {ToastrService} from 'ngx-toastr';

@Injectable()
export class NotificationService {

  constructor(
    private readonly toastr: ToastrService,
  ) { }

  public showNotification(err) {
    if (err.error && err.error.message.indexOf('project_zone_zone_name_unindex') >= -1) {
      const errorMessage = 'Project zone with the same name (in English) already exists. Please consider changing the name.';
      this.toastr.error(errorMessage, 'Error!');
    } else {
      this.toastr.error(err.error.message, 'Error!');
    }
  }
}
