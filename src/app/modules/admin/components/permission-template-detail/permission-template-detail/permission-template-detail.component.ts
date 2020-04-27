import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { CurrentUserService } from '../../../../../services/current-user.service';
import { LoaderService } from '../../../../../services/loader.service';

@Component({
  selector: 'app-permission-template-detail',
  templateUrl: './permission-template-detail.component.html',
  styleUrls: ['./permission-template-detail.component.scss']
})

export class PermissionTemplateDetailComponent implements OnInit {
  permissionTemplateId: number;
  editMode = false;

  // Permission Feature
  currentUser: any;
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false
  };

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService,
    private loaderService: LoaderService,
  ) { }

  async ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.permissionTemplateId = +params['id'];
      this.editMode = params['id'] != null;
    });

    try {
      this.loaderService.enable();
      this.currentUser = await this.currentUserService.get();
      this.permission = CurrentUserService.canFeature(this.currentUser, 'admin_rights_template');
    } finally {
      this.loaderService.disable();
    }
  }

  goBack() {
    this.location.back();
  }
}