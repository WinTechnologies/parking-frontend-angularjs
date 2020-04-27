import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionTemplateService } from '../../services/permission-template.service';
import { PermissionTemplate } from '../../models/permission-template.model';
import { PermissionFeature } from '../../models/shared.model';
import { PermissionSharedService } from '../../../../services/permission-shared.service';
import { LoaderService } from '../../../../services/loader.service';
import { configAdmin } from '../../../../../config/config-admin';
import { CurrentUserService } from '../../../../services/current-user.service';
import { ToastrService } from 'ngx-toastr';
import { AlertdialogComponent } from '../../../../components/alertdialog/alertdialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-permission-templates',
  templateUrl: './permission-templates.component.html',
  styleUrls: ['./permission-templates.component.scss']
})

export class PermissionTemplatesComponent implements OnInit {

  availableSections = configAdmin.availableSections;
  templates: PermissionTemplate[] = [];
  features: PermissionFeature[];

  // Permission Feature
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  constructor(
    private router: Router,
    private permissionTemplateService: PermissionTemplateService,
    private permissionSharedService: PermissionSharedService,
    private loaderService: LoaderService,
    private toastrService: ToastrService,
    private currentUserService: CurrentUserService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      const currentUser = await this.currentUserService.get();
      this.permission = CurrentUserService.canFeature(currentUser, 'admin_rights_template');

      const promises = [
        this.permissionTemplateService.getTemplates(),
        this.permissionSharedService.getFeatures()
      ];

      [this.templates, this.features] = await Promise.all(promises);

    } finally {
      this.loaderService.disable();
    }
  }

  onCreateTemplate() {
    this.router.navigate(['admin/permission-templates/new']);
  }

  onEditTemplate(template) {
    this.router.navigate([`admin/permission-templates/${template.id}`]);
  }

  getSectionIcon(template: PermissionTemplate, section: string) {
    const valid = this.features.some(feature => {
      return feature.section === section && !template[feature.feature]['is_off'];
    });
    if (valid) {
      return `assets/admin-section/${section.toLowerCase()}_active.svg`;
    } else {
      return `assets/admin-section/${section.toLowerCase()}_inactive.svg`;
    }
  }

  async onRemoveTemplate(event, template) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loaderService.enable();
        this.permissionTemplateService.deleteTemplate(template.id)
          .then(async (response) => {
            this.toastrService.success('The template is deleted successfully!', 'Success!');
            this.templates = await this.permissionTemplateService.getTemplates();
            this.loaderService.disable();
          })
        ;
      }
    });
  }
}