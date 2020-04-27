import { Component, Input, OnInit,ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import { ContraventionService } from '../../../services/contravention.service';

@Component({
  selector: 'app-table-columns-edit-dropdown',
  templateUrl: './table-columns-edit-dropdown.component.html',
  styleUrls: ['./table-columns-edit-dropdown.component.scss']
})

export class TableColumnsEditDropDownComponent implements OnInit {
  @ViewChild(MatMenuTrigger)

  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  menuData: any;

  columns = [];
  columnsOrigin: any = [];

  @Input() showFields: any;
  @Input() originFields: any;

  constructor(
    private contraventionService: ContraventionService,
    private changeDetector: ChangeDetectorRef
  ) {
    contraventionService.contextSubject.subscribe(
      contextEvent => {
         this.onContextMenu(contextEvent);
    });
  }

  ngOnInit() {
    this.columns = this.showFields;
    this.columns.forEach(field => {
      this.columnsOrigin.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });

    this.menuData = {
        menuItems: this.columns
    };
  }
  onContextMenu(event) {
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = this.menuData;
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  onShowFlag(index, flag) {
    this.columns[index].isShow = flag;
  }

  onApply() {
    this.contraventionService.setFields(this.columns);
  }

  onReset() {
    this.columns = [];
    this.columnsOrigin.forEach(field => {
      this.columns.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });

    this.menuData = {
      menuItems: this.columns
    };

    this.onApply();
  }
}
