import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class CoreService {
  public toggleSidebar: EventEmitter<any> = new EventEmitter();
  public updateSidebarMenu: EventEmitter<any> = new EventEmitter();
}
