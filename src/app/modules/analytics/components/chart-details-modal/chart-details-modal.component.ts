import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'app-chart-details-modal',
  templateUrl: './chart-details-modal.component.html',
  styleUrls: ['./chart-details-modal.component.scss']
})
export class ChartDetailsModalComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  matTableDataSource: MatTableDataSource<any>;
  matTableColumns = [];
  matTableHeaders = [];

  constructor(
    public dialogRef: MatDialogRef<ChartDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public widget
  ) {}

  ngOnInit() {
    if (this.widget.settings.type === 'map') {
      this.matTableHeaders = ['Latitude', 'Longitude'];
      this.matTableColumns = ['latitude', 'longitude'];
    } else {
      const yLabel = `${this.widget.settings.extra_params.aggregation}(${this.widget.settings.parameters.y})`;
      this.matTableHeaders = [yLabel, this.widget.settings.parameters.x];
      this.matTableColumns = ['y', 'x'];
      if (this.widget.settings.parameters.z) {
        this.matTableHeaders.push(this.widget.settings.parameters.z);
        this.matTableColumns.push('z');
      }
    }
    this.fetchMatTable(this.widget.dataSets);
  }

  fetchMatTable(items: any[]): void {
    this.matTableDataSource = new MatTableDataSource(items);
    this.matTableDataSource.sort = this.sort;
    this.matTableDataSource.paginator = this.paginator;
  }

  print() {
    // window.print();
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
