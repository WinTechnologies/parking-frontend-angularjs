import { Injectable } from '@angular/core';

@Injectable()
export class LoaderService {

  private isEnabled: boolean;

  constructor(
  ) { }

  enable() {
    setTimeout(() => {
      this.isEnabled = true;
      document.body.classList.add('cursor-wait');
    });
  }

  disable() {
    setTimeout(() => {
      this.isEnabled = false;
      document.body.classList.remove('cursor-wait');
    });
  }

  getIsEnabled() {
    return this.isEnabled;
  }
}
