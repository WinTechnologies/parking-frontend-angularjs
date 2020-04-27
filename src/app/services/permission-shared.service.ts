import { Injectable } from '@angular/core';
import {ApiService} from '../core/services/api.service';

@Injectable()
export class PermissionSharedService {

  private featuresPromise = null;
  private typesPromise = null;
  private availableSectionsPromise = null;

  constructor(
    private apiService: ApiService,
  ) { }

  getFeatures() {
    if (!this.featuresPromise) {
      this.featuresPromise = this.apiService.get('/pg/admin/permission-features');
    }
    return this.featuresPromise;
  }

  getAvailableSections() {
    if (!this.availableSectionsPromise) {
      this.availableSectionsPromise = this.apiService.get('/pg/admin/permission-features/available-sections');
    }
    return this.availableSectionsPromise;
  }

  getTypes() {
    if (!this.typesPromise) {
      this.typesPromise = this.apiService.get('/pg/admin/permission-types');
    }
    return this.typesPromise;
  }

  cleanPromises() {
    this.featuresPromise = null;
    this.typesPromise = null;
  }
}
