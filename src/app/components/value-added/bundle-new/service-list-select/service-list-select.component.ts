import { Component, OnInit, Inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { PgValueAddedService } from '../../services/value-added.service';
import { ValueAdded } from '../../models/value-added.model';
import { BundleService } from '../../models/bundle-service.model';
import { TableColumnsEditModalComponent } from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-service-list-select',
  templateUrl: './service-list-select.component.html',
  styleUrls: ['./service-list-select.component.scss']
})

export class ServiceListSelectionComponent implements OnInit, OnChanges {
  @Input() selected: BundleService[] = [];
  @Input() canUpdate = false;
  @Output() changedServiceEmitter: EventEmitter<ValueAdded[]> = new EventEmitter<ValueAdded[]>();

  services: ValueAdded[];
  dataSource: MatTableDataSource<ValueAdded>;
  allChecked: boolean;
  img_url = `${this.apiEndpoint}/`;

  displayedColumns = [
    {name: 'checkbox', label: 'Selection', isShow: true},
    {name: 'service_name_en', label: 'Items', isShow: true},
    {name: 'fee', label: 'Amount(SAR)', isShow: true}
  ];
  tableFields = [];
  showFields = [];

  total = 0;

  constructor(
    private readonly valueService: PgValueAddedService,
    private dialog: MatDialog,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
  ) { }

  ngOnChanges(change: SimpleChanges) {
    if (change.selected) {
      this.getService();
    }
  }

  ngOnInit() {
    this.getService();
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

  private getService(): void {
    this.valueService.get().subscribe(res => {
      this.services = res;
      this.services.forEach(service => {
        service['checked'] = !!this.selected.find(v => v.service_id === service.id);
      });
      this.calculateSelectedCount();
    });
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

  private calculateSelectedCount() {
    this.total = 0;
    const filteredService = this.services.filter(e => e['checked']);
    filteredService.forEach(v => {
      this.total += v.fee;
    });
    this.changedServiceEmitter.emit(filteredService);
  }

  public onSelect(event: any) {
    if (event.type === 'click') {
      event.row['checked'] = !event.row['checked'];
      this.calculateSelectedCount();
    }
  }

  public changeAllCheck() {
    this.services.forEach(value => {
      value['checked'] = this.allChecked;
    });
    this.calculateSelectedCount();
  }

  public changeCheckItem() {
    this.calculateSelectedCount();
  }
}