import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TreeviewConfig, TreeviewItem} from 'ngx-treeview';
import {PermissionFeature, PermissionType} from '../../../modules/admin/models/shared.model';

@Component({
  selector: 'app-permission-feature',
  templateUrl: './permission-feature.component.html',
  styleUrls: ['./permission-feature.component.scss']
})
export class PermissionFeatureComponent implements OnInit, OnChanges {

  @Input() feature: PermissionFeature;
  @Input() featureValue: PermissionType;
  @Input() canUpdate = false;
  @Output() changed = new EventEmitter();

  config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 400
  });

  items: TreeviewItem[];

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.featureValue) {
      this.items = this.makeItems();
    }
  }

  makeItems() {
    // All the permissions except for 'off'
    const enabledPermissions = this.feature.permission_type.split(', ').slice(1);
    const children = enabledPermissions.map((permission) => {
      return {text: permission.toUpperCase(), value: permission, checked: this.featureValue[`is_${permission}`], disabled: !this.canUpdate};
    });
    return [
      new TreeviewItem({
        text: this.feature.feature_name, value: 'off', checked: this.featureValue['is_off'], disabled: !this.canUpdate, children
      })
    ];
  }

  selectedChange(event) {
    if (!event.includes('view')) {
      this.changed.emit([]);
    } else {
      this.changed.emit(event);
    }
  }

}
