import { Injectable, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class NotificationService {

  constructor(
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService
  ) { }

  public success(message_key: string, title_key: string) {
    const messge = this.translateService.instant(message_key);
    const title = this.translateService.instant(title_key);
    this.toastr.success(messge, title);
  }

  public error(message_key: string, title_key: string) {
    const messge = this.translateService.instant(message_key);
    const title = this.translateService.instant(title_key);
    this.toastr.error(messge, title);
  }

  public warning(message_key: string, title_key: string) {
    const messge = this.translateService.instant(message_key);
    const title = this.translateService.instant(title_key);
    this.toastr.warning(messge, title);
  }

  public info(message_key: string, title_key: string) {
    const messge = this.translateService.instant(message_key);
    const title = this.translateService.instant(title_key);
    this.toastr.info(messge, title);
  }

  public show(message_key: string, title_key: string) {
    const messge = this.translateService.instant(message_key);
    const title = this.translateService.instant(title_key);
    this.toastr.show(messge, title);
  }
}
