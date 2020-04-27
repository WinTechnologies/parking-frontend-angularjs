import { Injectable } from '@angular/core';
import { StorageService } from '../../services/storage.service';

@Injectable()
export class GeneralviewFilterService {
  constructor(
    private storageService: StorageService,
  ) {
  }

  save(filters, key = 'global') {
    const storageData = this.get() || {};
    storageData[key] = filters;
    this.storageService.save(this.getStorageKey(), JSON.stringify(storageData));
  }

  get(key?: string) {
    const storageData = this.storageService.get(this.getStorageKey());
    return storageData ? key ? JSON.parse(storageData)[key] : JSON.parse(storageData) : undefined;
  }

  remove(key = 'global') {
    const storageData = this.get() || {};
    delete storageData[key];
    this.storageService.save(this.getStorageKey(), JSON.stringify(storageData));
  }

  clear() {
    this.storageService.remove(this.getStorageKey());
  }

  private getStorageKey() {
    return 'map/filters';
  }
}