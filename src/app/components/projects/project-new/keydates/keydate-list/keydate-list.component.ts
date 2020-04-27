import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Keydate } from '../keydates.model';
import { PgKeydatesService } from '../keydates.service';
import { KeydateNewComponent } from '../keydate-new/keydate-new.component';
import { ToastrService } from 'ngx-toastr';
import { AlertdialogComponent } from '../../../../alertdialog/alertdialog.component';
import { TableColumnsEditModalComponent } from '../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-keydate-list',
  templateUrl: './keydate-list.component.html',
  styleUrls: ['./keydate-list.component.scss']
})

export class KeydateListComponent implements OnInit, OnChanges {
  @Input() keydates: Keydate[] = [];
  displayedColumns = [
    {name: 'task_name', label: 'Task', isShow: true},
    {name: 'allday', label: 'All-day', isShow: true},
    {name: 'start_date', label: 'Start Date', isShow: true},
    {name: 'end_date', label: 'End Date', isShow: true},
    {name: 'repeat', label: 'Repeat', isShow: true},
    {name: 'remarks', label: 'Remarks', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];
  tableFields = [];
  showFields = [];
  dataSource = [];

  @Input() canUpdate = false;
  @Input() projectId: string;

  constructor(
    private readonly keydateService: PgKeydatesService,
    private readonly dialog: MatDialog,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.displayedColumns.forEach(field => {
      this.showFields.push(
        {
          name: field.name,
          label: field.label,
          isShow: field.isShow,
        }
      );
    });
    this.tableFields = this.showFields;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.keydates) {
      if (this.keydates.length) {
        setTimeout(() => {
          this.fetchMatTable(this.keydates);
        }, 100);
      }
    }
  }

  public editColumns() {
    const dialogRef = this.dialog.open(TableColumnsEditModalComponent, {
      width: '550px',
      data : {
        showFields: this.showFields,
        originFields: this.displayedColumns,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showFields = result;
        this.tableFields = this.showFields.filter(field => field.isShow);
      }
    });
  }

  public reorderColumns(event) {
    const newValue = this.tableFields[event.newValue];
    const prevValue = this.tableFields[event.prevValue];
    const newIndex = this.showFields.indexOf(newValue);
    const prevIndex = this.showFields.indexOf(prevValue);
    let i = 0 ;
    this.showFields = this.showFields.map(value => {
      value = i === newIndex ? prevValue : value;
      value = i === prevIndex ? newValue : value;
      i++;
      return value;
    });
    this.tableFields = this.showFields.filter(field => field.isShow);
  }

  private fetchMatTable(keydates: Keydate[]): void {
    this.dataSource = keydates.slice(0);
  }

  public onAdd() {
    const dialogRef = this.dialog.open(KeydateNewComponent, {
      width: '760px'
    });

    dialogRef.beforeClosed().subscribe(result => {
      if (!result) {
        return;
      }

      const find = this.keydates.find(k => k.task_name === result.task_name);
      if(find) {
        this.toastr.error('The task name is duplicated!', 'Error');
        return;
      } else {
        if (result) {
          this.keydates.push(result);
          if (this.projectId) {
            this.toastr.info('Please click on update button to save all your modifications.');
          }
        }
        this.fetchMatTable(this.keydates);
      }
    });
  }

  public onEdit(event: any) {
    if (event.type === 'click') {
      const index = this.keydates.indexOf(event.row);
      if (!this.canUpdate) {
        return;
      }
      const dialogRef = this.dialog.open(KeydateNewComponent, {
        width: '760px',
        data: {keydate: event.row}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.keydates[index] = result;
          this.fetchMatTable(this.keydates);
        }
      });
    }
  }

  public onDelete(event: any, keydate: Keydate) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete ' + keydate.task_name + ' task?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const findIndex = this.keydates.findIndex(v => {
          return v.id === keydate.id;
        });

        this.keydates.splice(findIndex, 1);
        if (this.projectId) {
          this.toastr.info('Please click on update button to save all your modifications.');
        }
        this.fetchMatTable(this.keydates);
      }
    });
  }
}