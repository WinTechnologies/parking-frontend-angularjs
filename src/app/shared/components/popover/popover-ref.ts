import { OverlayRef } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { TemplateRef, Type } from '@angular/core';

export interface PopoverSelectEvent<T = any> {
  type: 'select';
  data: T;
}

export interface PopoverCloseEvent<T = any> {
  type: 'backdropClick' | 'close';
  data: T;
}

export type PopoverContent = TemplateRef<any> | Type<any> | string;

export class PopoverRef<T = any> {
  private afterClosed = new Subject<PopoverCloseEvent<T>>();
  private afterSelected = new Subject<PopoverSelectEvent<T>>();

  afterClosed$ = this.afterClosed.asObservable();
  afterSelected$ = this.afterSelected.asObservable();

  constructor(public overlay: OverlayRef,
              public content: PopoverContent,
              public data: T) {
    overlay.backdropClick().subscribe(() => {
      this._close('backdropClick', null);
    });
  }

  close(data?: T) {
    this._close('close', data);
  }

  select(data?: T) {
    this._select('select', data);
  }

  private _select(type: PopoverSelectEvent['type'], data?: T) {
    this.afterSelected.next({
      type,
      data
    });
  }

  private _close(type: PopoverCloseEvent['type'], data?: T) {
    this.overlay.dispose();
    this.afterClosed.next({
      type,
      data
    });
    this.afterClosed.complete();
    this.afterSelected.complete();
  }
}
