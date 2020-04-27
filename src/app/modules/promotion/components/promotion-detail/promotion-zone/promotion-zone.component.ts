import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {LoaderService} from '../../../../../services/loader.service';
import {ApiService} from '../../../../../core/services/api.service';
import {PromotionService} from '../../../services/promotion.service';
import {Subscription} from 'rxjs';
import {TableColumnsEditModalComponent} from '../../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-promotion-zone',
  templateUrl: './promotion-zone.component.html',
  styleUrls: ['./promotion-zone.component.scss']
})
export class PromotionZoneComponent implements OnInit, OnDestroy {

  @Input() promotion: any;
  @Input() canUpdate = false;

  selectedProjects: any[] = [];

  originParkings: any[] = [];
  filteredParkings: any[] = [];
  originfilteredParkings: any[] = [];
  selectedParkingIds: any[] = [];

  availableZones: any[] = [];
  originZones: any[] = [];

  allChecked = false;
  displayedColumns = [
    {name: 'checked', label: 'Check Box', isShow: true},
    {name: 'zone_code', label: 'Zone Code', isShow: true},
    {name: 'number', label: 'Parking Number', isShow: true},
    {name: 'parking_code', label: 'Parking Code', isShow: true},
    {name: 'name', label: 'Parking Name', isShow: true},
    {name: 'parking_spaces', label: 'Parking Spaces', isShow: true},
    {name: 'parking_type', label: 'Parking Type', isShow: true}
  ];
  tableFields = [];
  showFields = [];

  private selectedProjectsSubscription: Subscription;

  constructor(
    private loaderService: LoaderService,
    private apiService: ApiService,
    private promotionService: PromotionService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    this.selectedProjectsSubscription = this.promotionService.getSelectedProjects().subscribe(selectedProjects => {
      if (selectedProjects) {
        this.selectedProjects = selectedProjects;
        if (this.originParkings.length) {
          this.filterParkings();
        }
      }
    });

    try {
      this.loaderService.enable();
      const promises = [
        this.apiService.get('/pg/parkings/with-zone'),
        this.apiService.get('/pg/project-zones')
      ];
      const [responseParkings, responseZones] = await Promise.all(promises);
      this.originParkings = responseParkings.map((parking) => ({
        ...parking,
        checked: this.promotion.selectedParkings.includes(parking.id)
      }));
      this.originZones = responseZones.slice(0);
      this.filterParkings();
    } finally {
      this.loaderService.disable();
    }

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

  ngOnDestroy(): void {
    if (this.selectedProjectsSubscription) {
      this.selectedProjectsSubscription.unsubscribe();
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

  filterParkings() {
    this.availableZones = this.originZones.filter(zone => this.selectedProjects.includes(zone.project_id));
    this.filteredParkings = this.originParkings.filter(parking => this.selectedProjects.includes(parking.project_id));
    this.fetchMatTable(this.filteredParkings);
  }

  applyFilterParkings(filterValue: string) {
    if (filterValue) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
    }
    if (this.originfilteredParkings) {
      this.filteredParkings = this.originfilteredParkings.filter(row => {
        let bRet = true;
        let cRet = false;
        this.tableFields.forEach(value => {
          if (row[value.name]) {
            cRet = cRet || (row[value.name].toString().toLowerCase().indexOf(filterValue) >= 0);
          }
        });
        bRet = bRet && cRet;
        return bRet;
      });
    }
  }

  fetchMatTable(parkings): void {
    this.originfilteredParkings = parkings;
    this.emitSelectedParking();
  }

  checkAll(event) {
    this.filteredParkings.forEach((parking) => parking.checked = event.checked);
    this.emitSelectedParking();
  }

  onChangeZone(event) {
    if (event.value) {
      this.filteredParkings = this.originParkings
        .filter(parking => this.selectedProjects.includes(parking.project_id))
        .filter((parking) => parking.zone_id === event.value);
    } else {
      this.filteredParkings = this.originParkings
        .filter(parking => this.selectedProjects.includes(parking.project_id));
    }
    this.fetchMatTable(this.filteredParkings);
  }

  emitSelectedParking() {
    this.selectedParkingIds = this.filteredParkings.filter((parking) => parking.checked)
      .map(parking => parking.id);
    this.promotion.selectedParkings = this.selectedParkingIds;
  }

  checkParking() {
    this.emitSelectedParking();
  }

  getAllChecked() {
    return this.filteredParkings && this.filteredParkings.every(parking => parking.checked);
  }

}
