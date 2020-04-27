import { Injectable } from '@angular/core';
import {ApiService} from '../core/services/api.service';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from '../core/services/auth.service';

@Injectable()
export class CurrentUserService {

  private currentUserPromise = null;
  public currentUser: any;

  static canFeatureType(currentUser: any, features: string[] | string, type: string) {
    if (Array.isArray(features)) {
      return features.some(feature => currentUser && currentUser.permission_template[feature][type]);
    } else {
      return currentUser && currentUser.permission_template[features][type];
    }
  }

  static canView(currentUser: any, features: string[] | string): boolean {
    return CurrentUserService.canFeatureType(currentUser, features, 'is_view');
  }

  static canCreate(currentUser: any, features: string[] | string) {
    return CurrentUserService.canFeatureType(currentUser, features, 'is_create');
  }

  static canUpdate(currentUser: any, features: string[] | string) {
    return CurrentUserService.canFeatureType(currentUser, features, 'is_update');
  }

  static canDelete(currentUser: any, features: string[] | string) {
    return CurrentUserService.canFeatureType(currentUser, features, 'is_delete');
  }

  static canFeature(currentUser: any, feature: string) {
    return {
      isCreate: CurrentUserService.canCreate(currentUser, feature),
      isUpdate: CurrentUserService.canUpdate(currentUser, feature),
      isDelete: CurrentUserService.canDelete(currentUser, feature),
    };
  }

  constructor(
    private apiService: ApiService,
    private toastrService: ToastrService,
    private authService: AuthService,
  ) { }

  // ToDo:: It will be updated when authentication is updated.
  get() {
    if (!this.currentUserPromise) {
      this.currentUserPromise = this.authService.getProfile()
        .toPromise()
      ;
    }
    return this.currentUserPromise;
  }

  clean() {
    this.currentUserPromise = null;
  }

  showNotAccessToastr() {
    this.toastrService.error('Access Denied');
  }
}
