import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TariffSegmentService } from '../../services/tariff-segment.service';
import { LoaderService } from '../../../../services/loader.service';
import { AlertdialogComponent } from '../../../../components/alertdialog/alertdialog.component';
import { ToastrService } from 'ngx-toastr';
import {TableColumnsEditModalComponent} from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-tariff-segments-table',
  templateUrl: './tariff-segments-table.component.html',
  styleUrls: ['./tariff-segments-table.component.scss']
})
export class TariffSegmentsTableComponent implements OnInit, OnChanges {

  @Input() segments = [];
  @Output() selectSegment = new EventEmitter<any>();

  dataSource: any = [];
  displayedColumns = [
    {name: 'segment_name', label: 'Segment name', isShow: true},
    {name: 'type_tariff', label: 'Price type', isShow: true},
    {name: 'applicable_days', label: 'Applicable days', isShow: true},
    {name: 'application_hours', label: 'Application hours', isShow: true},
    {name: 'date_start', label: 'Start date', isShow: true},
    {name: 'date_end', label: 'End date', isShow: true},
    {name: 'action', label: 'Action', isShow: true}
  ];
  showFields: any = [];
  tableFields: any = [];

  constructor(
    private tariffSegmentService: TariffSegmentService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private toastrService: ToastrService,
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
    this.dataSource = this.segments;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.dataSource = this.segments;
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


  public onEdit(segment: any) {
    this.selectSegment.emit(segment);
  }

  public onCopy(segment: any) {
    const tmpSegment = {...segment};
    tmpSegment.id = null;
    this.selectSegment.emit(tmpSegment);
  }

  public onDelete(segment: any) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete this segment?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tariffSegmentService.delete(segment.id).then(res => {
          this.toastrService.success(
            'The segment is deleted Successfully!',
            'Success!'
          );
          this.segments.splice(this.segments.indexOf(segment), 1);
        });
      }
    });
  }


}
