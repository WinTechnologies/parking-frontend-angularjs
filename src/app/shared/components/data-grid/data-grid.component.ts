import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { LoaderService } from '../../../services/loader.service';
import { Filter, MatTableFilterService } from '../../../services/mat-table-filter.service';
import { ColumnDef, MatTableDefinitionService } from '../../../services/mat-table-definition.service';
import { AlertdialogComponent } from '../../../components/alertdialog/alertdialog.component';
import { RedirectDialogComponent } from '../../../components/redirect-dialog/redirect-dialog.component';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent<T> implements OnInit {
  _tableName: string;

  @Input() set tableName(value: string) {
    this._tableName = value;
    this.getColumns();
  }

  get tableName() {
    return this._tableName;
  }

  @Input() title: string;

  @Input() useSearch = false;
  @Input() useSelectConfirmation = false;
  @Input() useDeletion = false;
  @Input() useDeleteConfirmation = false;

  @Input() useRedirectDialog = false;

  @Output() rowSelect = new EventEmitter<T>();
  @Output() rowDelete = new EventEmitter<T>();
  @Output() rowRedirect = new EventEmitter<T>();

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.dataSource.sort = ms;
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.dataSource.paginator = mp;
  }

  @ViewChild(MatMenuTrigger) matMenu;

  columnsDef = {
    columns: new Array<ColumnDef>(),
    showColumns: new Array<ColumnDef>(),
    showColumnNames: new Array<string>(),
    showColumnLabels: new Array<string>(),
    filterColumns: new Array<ColumnDef>(),
    filterColumnNames: new Array<string>(),
    filterColumnLabels: new Array<string>(),
  };

  dataSource: MatTableDataSource<T>;
  filter: Filter<T>;

  loading = true;

  dragStartedIndex: number = null;

  contextMenuPosition = {
    x: '0px',
    y: '0px',
  };

  matMenuColumns = [];

  constructor(
    private loaderService: LoaderService,
    @Inject('API_ENDPOINT') protected apiEndpoint: string,
    private filterService: MatTableFilterService,
    private matTableDefinitionService: MatTableDefinitionService,
    private dialog: MatDialog,
  ) {
    this.dataSource = new MatTableDataSource<T>([]);
    this.filter = this.filterService.createFilter(this.dataSource);
  }

  ngOnInit(): void {
  }

  public setData(data: T[]) {
    this.loading = true;
    this.dataSource.data = data;
    this.loading = false;
  }

  setColumns(columns: ColumnDef[]) {
    const showColumns = columns.filter(c => c.is_show);

    const filterColumns = showColumns.map(c => ({
      ...c,
      filter_name: `${c.column_name}_filter`,
    }));

    const showColumnNames = showColumns.map(c => c.column_name);
    const filterColumnNames = filterColumns.map(c => c.filter_name);

    this.columnsDef = {
      columns,
      showColumns,
      showColumnNames,
      showColumnLabels: showColumns.map(c => c.column_label),
      filterColumns: filterColumns,
      filterColumnNames,
      filterColumnLabels: filterColumns.map(c => c.column_label),
    };
  }

  getColumns() {
    const untilGetTableDef = new Subject<boolean>();
    this.matTableDefinitionService.getTableDef(this.tableName)
      .takeUntil(untilGetTableDef)
      .subscribe(columns => {
        if (this.useDeletion) {
          columns.push(this.matTableDefinitionService.makeActionColumn());
        }

        untilGetTableDef.next(true);
        untilGetTableDef.complete();

        this.setColumns(columns);
      });
  }

  applyFilter(filterValue: Event) {
    const value = (filterValue.target as HTMLInputElement).value;
    this.filter.applySimpleFilter(value, this.columnsDef.showColumnNames);
  }

  onDropListDropped(event, i) {
    const tempColumns = [...this.columnsDef.columns];

    const tempColumn = tempColumns[this.dragStartedIndex];
    tempColumns[this.dragStartedIndex] = tempColumns[i];
    tempColumns[i] = tempColumn;

    this.setColumns(tempColumns);

    try {
      this.matTableDefinitionService.updateTableDef(this.tableName, tempColumns);
    } finally {
    }

    this.dragStartedIndex = null;
  }

  onDragStarted(event, i) {
    this.dragStartedIndex = i;
  }

  onContextMenu(event) {
    this.matMenuColumns = this.columnsDef.columns.map(c => ({...c}));

    this.contextMenuPosition.x = `${event.clientX}px`;
    this.contextMenuPosition.y = `${event.clientY}px`;

    this.matMenu.menu.focusFirstItem('mouse');
    this.matMenu.openMenu();
  }

  onChangePaginator() {
    this.dataSource._updateChangeSubscription();
  }

  onShowInMenu(i: number, isShow: boolean) {
    this.matMenuColumns[i].isShow = isShow;
  }

  onApplyColumnsShow() {
    this.setColumns(this.matMenuColumns);

    try {
      this.matTableDefinitionService.updateTableDef(this.tableName, this.matMenuColumns);
    } finally {
    }
  }

  onResetColumnsShow() {
    this.getColumns();
  }

  onRowSelect(item: T): void {
    if (!this.useSelectConfirmation) {
      this.rowSelect.emit(item);
      return;
    }

    if (this.useRedirectDialog) {
      const redirectDialogRef = this.dialog.open(RedirectDialogComponent, {
        data: {
          title: 'Are you sure?',
          message: 'The website will be redirected to selected page if you leave this page.',
          question: 'Would you like to:',
          btnStay: 'Stay on this page',
          btnLeave: 'Leave this page',
          btnNewTab: 'Open in new tab',
        },
      });

      const untilClosedRedirectDialog = new Subject<boolean>();
      redirectDialogRef.afterClosed()
        .takeUntil(untilClosedRedirectDialog)
        .subscribe(result => {
          if (result === 'leave') {
            this.rowSelect.emit(item);
          }

          if (result === 'new-tab') {
            this.rowRedirect.emit(item);
          }

          untilClosedRedirectDialog.next(true);
          untilClosedRedirectDialog.complete();
        });

      return;
    }

    const alertDialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: `Are you sure you want to leave this page?`,
        btnOk: 'Yes',
        btnCancel: 'Cancel',
      },
    });

    const untilClosedAlertDialog = new Subject<boolean>();
    alertDialogRef.afterClosed()
      .takeUntil(untilClosedAlertDialog)
      .subscribe(result => {
        if (result) {
          this.rowSelect.emit(item);
        }

        untilClosedAlertDialog.next(true);
        untilClosedAlertDialog.complete();
      });
  }

  onRowDeletion(item: T): void {
    if (!this.useDeleteConfirmation) {
      this.rowDelete.emit(item);
      return;
    }

    const alertDialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete ?',
        btnOk: 'Yes',
        btnCancel: 'Cancel'
      },
    });

    const untilClosedAlertDialog = new Subject<boolean>();
    alertDialogRef.afterClosed()
      .takeUntil(untilClosedAlertDialog)
      .subscribe(result => {
        if (result) {
          this.rowDelete.emit(item);
        }

        untilClosedAlertDialog.next(true);
        untilClosedAlertDialog.complete();
      });
  }
}
