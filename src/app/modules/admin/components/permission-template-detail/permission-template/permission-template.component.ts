import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { PermissionFeature, PermissionType } from '../../../models/shared.model';
import { PermissionTemplate } from '../../../models/permission-template.model';
import { PermissionTemplateService } from '../../../services/permission-template.service';
import { PermissionSharedService } from '../../../../../services/permission-shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../../../../services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../../../../services/current-user.service';
import { configAdmin } from '../../../../../../config/config-admin';
import { CoreService } from '../../../../../services/core.service';
import { TreeviewConfig, TreeviewItem } from 'ngx-treeview';

@Component({
  selector: 'app-permission-template',
  templateUrl: './permission-template.component.html',
  styleUrls: ['./permission-template.component.scss']
})

export class PermissionTemplateComponent implements OnInit {
  @Input() id: number;
  @Input() editMode = false;
  @Input() canUpdate = false;
  @Input() isPreview = false;

  template: PermissionTemplate;
  allTemplates: PermissionTemplate[];

  features: PermissionFeature[] = [];
  globalFeatures: PermissionFeature[] = [];
  projectFeatures: PermissionFeature[] = [];

  types: PermissionType[] = [];
  defaultPermissionType: PermissionType;

  featureSubmitted = false;

  public config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 400
  });
  public items: TreeviewItem[] = [];
  private selectedOptions: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public location: Location,
    private permissionTemplateService: PermissionTemplateService,
    private permissionSharedService: PermissionSharedService,
    private loaderService: LoaderService,
    private toastrService: ToastrService,
    private currentUserService: CurrentUserService,
    private coreService: CoreService,
  ) { }

  ngOnInit() {
    this.canUpdate = !this.editMode || this.canUpdate;
    this.initData();
  }

  /**
   * act on Treeview dropdown item was selected
   * @param event
   */
  public async onSelectedChange(event: number[]): Promise<void> {
    if (event.length) {
      const temp: number = event.find((id: number) => this.selectedOptions.indexOf(id) > -1);
      const selectedId: number = event.find((id: number) => this.selectedOptions.indexOf(id) === -1);
      if (selectedId && this.id !== selectedId) {
        // uncheck previous option
        this.items = this.items.map(item => {
          if (item.value === temp) {
            item.checked = false;
          }
          return item;
        });
        // set check to a selected one
        this.id = selectedId;
        this.template = await this.permissionTemplateService.getTemplate(this.id);
        this.items = this.createItems(this.allTemplates);
        this.selectedOptions = [selectedId];
      }
    } else {
      if (this.allTemplates) {
        this.items = this.createItems(this.allTemplates);
      }
    }
  }

  private async initData() {
    try {
      this.loaderService.enable();
      const promises = [
        this.permissionSharedService.getFeatures(),
        this.permissionSharedService.getTypes()
      ];
      [this.features, this.types] = await Promise.all(promises);
      this.defaultPermissionType = this.types.find(type => type.permission_type === configAdmin.offPermissionType);
      this.globalFeatures = this.features.filter(feature => feature.section !== 'Project');
      this.projectFeatures = this.features.filter(feature => feature.section === 'Project');
      if (this.editMode) {
        [this.template, this.allTemplates] = await Promise.all([
          this.permissionTemplateService.getTemplate(this.id),
          this.permissionTemplateService.getTemplates(),
        ]);
        this.items = this.createItems(this.allTemplates);
      } else {
        this.template = PermissionTemplateService.createDefaultTemplate(this.features, this.defaultPermissionType);
      }

    } finally {
      this.loaderService.disable();
    }
  }

  /**
   * transform array of templates into array of TreeviewItems
   * @param templates
   */
  private createItems(templates: PermissionTemplate[]): TreeviewItem[] {
    const items: TreeviewItem[] = templates.map((template) => {
      template.id === this.template.id && this.selectedOptions.push(template.id);
      return new TreeviewItem({
        text: template.template_name, value: template.id, checked: template.id === this.template.id
      });
    }).sort((current, next) => {
      if (current.text > next.text) {
        return 1;
      }
      if (current.text < next.text) {
        return -1;
      }
      return 0;
    });
    return items;
  }

  async saveTemplate() {
    this.featureSubmitted = true;
    if (!this.template.template_name) {
      return false;
    }

    try {
      this.loaderService.enable();
      if (this.editMode) {
        await this.permissionTemplateService.updateTemplate(this.template);
        this.toastrService.success('The template is updated successfully!', 'Success!');
        this.currentUserService.clean();
        this.coreService.updateSidebarMenu.emit();
      } else {
        this.template.template_desc = ''; // TODO: it should be updated.
        await this.permissionTemplateService.createTemplate(this.template);
        this.toastrService.success('The template is created successfully!', 'Success!');
        setTimeout(() => {
          this.router.navigate(['/admin/permission-templates']);
        }, 300);
      }
    } finally {
      this.loaderService.disable();
    }
  }

  onChangeFeature(event, featureName) {
    this.template[featureName] = this.types.find((type) => {
      return type.is_off === (event.length === 0) &&
        type.is_view === event.includes('view') &&
        type.is_create === event.includes('create') &&
        type.is_update === event.includes('update') &&
        type.is_delete === event.includes('delete');
    });
  }

  goBack() {
    this.location.back();
  }
}