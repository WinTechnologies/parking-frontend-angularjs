import { Component, OnInit, Input, ViewChild, Output, EventEmitter, Inject } from '@angular/core';

import {MatTableDataSource, MatSort, MatPaginator, MatDialog} from '@angular/material';
import {CarparkItemType} from '../../../modules/project-setup/carpark-setup/models/carpark.model';
import {ProjectZone} from '../../../modules/project-setup/common-setup/models/onstreet/project_zone.model';
import {Gate, Lane, ParkLevel, ParkSpace, ParkZone, Parking, Terminal} from '../../../modules/project-setup/carpark-setup/models/carpark-items.model';
import {Asset} from '../../../components/assets/models/asset.model';
import {MapZoom} from '../../classes/MapOptions';
import { TableColumnsEditModalComponent } from '../table-columns-edit-modal/table-columns-edit-modal.component';

@Component({
  selector: 'app-listview-new',
  templateUrl: './listview-new.component.html',
  styleUrls: ['./listview-new.component.scss']
})
export class ListviewNewComponent implements OnInit {
  CarparkItemType = CarparkItemType;

  @Input() projectId: number;
  @Input() filter: string;
  @Input() options: any;
  @Input() mapdata: any;
  @Input() mapdrawdata: any;
  @Input() listType: string | CarparkItemType;
  @Input() listData: any[];
  @Input() tblStyle: string;

  @Output() updateMapData = new EventEmitter<string>();
  @Output() selectedRowItem = new EventEmitter<ProjectZone | Terminal | Parking | ParkLevel | ParkZone | Gate | Lane | ParkSpace | Asset>();

  public storeOptions: any;
  public stroreMapdata: any;
  public baseUrl = this.apiEndpoint;
  public dataSource: MatTableDataSource<any>;
  public displayedParkingColumns = [
    {name: 'pictures_url', label: ''},
    {name: 'number', label: 'Number'},
    {name: 'parking_code', label: 'Code'},
    {name: 'name', label: 'Name'},
    {name: 'parking_angle', label: 'Angle'},
    {name: 'parking_spaces', label: 'Spaces', from: 'spaces_nbr_from', to: 'spaces_nbr_to'},
    {name: 'parking_dimension', label: 'Dimension'},
    {name: 'is_sensors', label: 'Sensor'},
    {name: 'parking_type', label: 'Type'},
    {name: 'managed_by', label: 'Managed by'},
    {name: 'project_name', label: 'Project'},
    {name: 'zone_id', label: 'Zone'},
    {name: 'info_notes', label: 'Notes'},
    {name: 'payment_methods', label: 'Payments'}
  ];
  public displayedSignageColumns = [
    {name: 'img_url', label: '', first: ''},
    {name: 'codification_id', label: 'Codification'},
    {name: 'model_code', label: 'Code'},
    {name: 'status', label: 'Status'},
    {name: 'zone_code', label: 'Zone Code'},
    {name: 'zone_txt', label: 'Zone Name'},
    {name: 'date_created', label: 'Created At'},
    {name: 'date_deployed', label: 'Deployed At'},
    {name: 'manufacturer', label: 'Manufacturer'},
    {name: 'firmware_version', label: 'Version'},
    {name: 'model_txt', label: 'Model'},
    {name: 'date_end_of_life', label: 'EOF'},
    {name: 'product_warranty', label: 'Warranty'},
    {name: 'ip_address', label: 'IP'},
    {name: 'city_txt', label: 'City'}
  ];
  public displayedParkingMeterColumns = [
    {name: 'img_url', label: '', first: ''},
    {name: 'codification_id', label: 'Codification'},
    {name: 'model_code', label: 'Code'},
    {name: 'status', label: 'Status'},
    {name: 'zone_code', label: 'Zone Code'},
    {name: 'zone_txt', label: 'Zone Name'},
    {name: 'date_created', label: 'Created At'},
    {name: 'date_deployed', label: 'Deployed At'},
    {name: 'manufacturer', label: 'Manufacturer'},
    {name: 'firmware_version', label: 'Version'},
    {name: 'model_txt', label: 'Model'},
    {name: 'date_end_of_life', label: 'EOF'},
    {name: 'product_warranty', label: 'Warranty'},
    {name: 'ip_address', label: 'IP'},
    {name: 'city_txt', label: 'City'}
  ];
  public displayedZoneColumns = [
    {name: 'zone_code', label: 'Code'},
    {name: 'zone_name', label: 'Name'},
    {name: 'perimeter', label: 'Perimeter'},
    {name: 'area', label: 'Area'},
    {name: 'created_at', label: 'Created At'},
    {name: 'created_by', label: 'Creator ID'},
    {name: 'fullname', label: 'Creator Fullname'},
  ];
  public displayedOpenLandColumns = [
    {name: 'land_name', label: 'Name'},
    {name: 'perimeter', label: 'Perimeter'},
    {name: 'area', label: 'Area'},
    {name: 'zone_txt', label: 'Zone'},
    {name: 'created_at', label: 'Created At'},
    {name: 'created_by', label: 'Created By'}
  ];

  public displayedCarparkColumns = {
    terminal: [
      {name: 'terminal_code', label: 'Terminal Code'},
      {name: 'terminal_name', label: 'Terminal Name'},
      {name: 'airport_code', label: 'Airport Code'},
      {name: 'airport_name', label: 'Airport Name'},
      {name: 'img_url', label: 'Picture'},
      {name: 'notes', label: 'Notes'},
      {name: 'zone', label: 'Zone'},
      {name: 'created_at', label: 'Created at'},
      {name: 'created_by', label: 'Created by'}
    ],
    parking: [
      {name: 'code', label: 'Carpark Code'},
      {name: 'carpark_name', label: 'Carpark Name'},
      {name: 'carpark_type', label: 'Carpark Type'},
      {name: 'is_automated', label: 'Automated'},
      {name: 'managed_by', label: 'Mawgif'},
      {name: 'img_url', label: 'Picture'},
      {name: 'operation_type', label: 'Operation Type'},
      {name: 'zone', label: 'Zone'},
      {name: 'terminal', label: 'Terminal'},
      {name: 'created_at', label: 'Created at'},
      {name: 'created_by', label: 'Created by'}
    ],
    parkLevel: [
      {name: 'code', label: 'Level Code'},
      {name: 'name', label: 'Level Name'},
      {name: 'img_url', label: 'Picture'},
    ],
    parkZone: [
      {name: 'name_en', label: 'Carpark Zone Name'},
      {name: 'img_url', label: 'Picture'},
      {name: 'area', label: 'Area'},
      {name: 'perimeter', label: 'Perimeter'},
      {name: 'measurement_unit', label: 'Measurement Unit'},
    ],
    gate: [
      {name: 'name_en', label: 'Gate Name'},
      {name: 'name_ar', label: 'Gate Name(AR)'},
      {name: 'img_url', label: 'Picture'},
    ],
    lane: [
      {name: 'name_en', label: 'Lane Name'},
      {name: 'name_ar', label: 'Lane Name(AR)'},
    ],
    parkSpace: [
      {name: 'code', label: 'Space Code'},
      {name: 'name', label: 'Space Name'},
      {name: 'img_url', label: 'Picture'},
      {name: 'vehicle_type', label: 'Vehicle Type'},
      {name: 'for_handicap', label: 'For Handicap'},
      {name: 'is_sensor', label: 'Is Sensor'},
    ],
    asset: [
      {name: 'img_url', label: '', first: ''},
      {name: 'codification_id', label: 'Codification'},
      {name: 'model', label: 'Model'},
      {name: 'status', label: 'Status'},
      {name: 'zone_id', label: 'Zone ID'},
      {name: 'created_at', label: 'Created At'},
      {name: 'deployed_at', label: 'Deployed At'},
      {name: 'warranty_until', label: 'Warranty Until'},
      {name: 'ip_address', label: 'IP'},
    ],
  };

  public listColumns = [];
  public storedColumns = [];
  public storedFilterColumns = [];
  public listColumnsNoPics: any[];

  public defineClass: any;

  public isPreviewOn = false;
  public isImagePreviewOn = false;
  public mapPositionCenter: any;
  public selectedRow: any; // parking or other type
  public parkingImages: string[];
  public isImageZoomOn = false;
  public selectedImg: any;
  public listCategory = 'carPark';
  public defaultZoomSize = 18;
  constructor(
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    private readonly dialog: MatDialog,
    ) { }

  ngOnInit() {
    this.defineClass = this._defineClass.bind(this);
    this.defineListColumns(this.listType);
    this.storeOptions = Object.assign({}, this.options);
  }

  public defineListColumns(listType: string | CarparkItemType): void {
    switch (listType) {
      // Onstreet Setup
      case 'Parking':
        this._defineListColumns(this.displayedParkingColumns, MapZoom.Carpark);
        this.listColumnsNoPics = this.listColumns.filter(field => field['name'] !== 'pictures_url');
        this.listCategory = 'onStreet';
        break;
      case 'Signage':
        this._defineListColumns(this.displayedSignageColumns, MapZoom.CarparkZone);
        this.listColumnsNoPics = this.listColumns.filter(field => field['name'] !== 'img_url');
        this.listCategory = 'onStreet';
        break;
      case 'Parking meter':
        this._defineListColumns(this.displayedParkingMeterColumns, MapZoom.CarparkZone);
        this.listColumnsNoPics = this.listColumns.filter(field => field['name'] !== 'img_url');
        this.listCategory = 'onStreet';
        break;
      case 'onStreetZone':
        this._defineListColumns(this.displayedZoneColumns, MapZoom.ProjectZone);
        this.listCategory = 'onStreet';
        this.listType = 'Zone';
        break;
      case 'Open land':
        this._defineListColumns(this.displayedOpenLandColumns, MapZoom.ProjectZone);
        this.listCategory = 'onStreet';
        break;

      //  Carpark Setup
      case CarparkItemType.Zone:
        this._defineListColumns(this.displayedZoneColumns, MapZoom.ProjectZone);
        break;
      case CarparkItemType.Terminal:
        this._defineListColumns(this.displayedCarparkColumns.terminal, MapZoom.ProjectZone);
        break;
      case CarparkItemType.Parking:
        this._defineListColumns(this.displayedCarparkColumns.parking, MapZoom.ProjectZone);
        break;
      case CarparkItemType.Level:
        this._defineListColumns(this.displayedCarparkColumns.parkLevel, MapZoom.Carpark);
        break;
      case CarparkItemType.ParkZone:
        this._defineListColumns(this.displayedCarparkColumns.parkZone, MapZoom.CarparkZone);
        break;
      case CarparkItemType.Gate:
        this._defineListColumns(this.displayedCarparkColumns.gate, MapZoom.CarparkZone);
        break;
      case CarparkItemType.Lane:
        this._defineListColumns(this.displayedCarparkColumns.lane, MapZoom.CarparkZone);
        break;
      case CarparkItemType.ParkSpace:
        this._defineListColumns(this.displayedCarparkColumns.parkSpace, MapZoom.CarparkZone);
        break;
      case CarparkItemType.Asset:
        this._defineListColumns(this.displayedCarparkColumns.asset, MapZoom.CarparkZone);
        break;
      default:
        break;
    }
  }

  private _defineListColumns(columns: any[], zoom: number) {
    this.defaultZoomSize = zoom;
    this.listColumns = columns.map(field => {
      field['isShow'] = true;
      return field;
    });

    if (this.listType !== 'Signage' && this.listType !== 'Parking' && this.listType !== 'Parking meter') {
      this.listColumnsNoPics = this.listColumns;
    }

    this.storedColumns = this.listColumns;
    this.storedFilterColumns = this.listColumns;
    this.isImagePreviewOn = true;
  }

  /**
   * onClick on datatable row (both datatable)
   * @param event
   */
  public onRowSelect(event): void {
    if (event.type === 'click') {
      this.isImageZoomOn = false;
      this.selectedImg = null;

      const polygonType = [
        'Zone', 'Open land',
        CarparkItemType.Level, CarparkItemType.Parking,
        CarparkItemType.ParkZone, CarparkItemType.Lane
      ];
      const pointType = [
        'Signage', 'Parking meter',
        CarparkItemType.Terminal, CarparkItemType.Gate,
        CarparkItemType.ParkSpace, CarparkItemType.Asset
      ];
      const assetTypes = [
        'Signage', 'Parking meter',
        CarparkItemType.Asset,
      ];

      if (pointType.includes(this.listType)) {
        this.switchSideBarMapFeature(event,
          assetTypes.includes(this.listType) ? 'codification_id' : 'id',
          false);
      } else {
        this.switchSideBarMapFeature(event,
          assetTypes.includes(this.listType) ? 'codification_id' : 'id',
          polygonType.includes(this.listType));
      }
    }
  }

  public switchSideBarMapFeature(event, key: string, isPolygon: boolean): void {
    if (!this.selectedRow || this.selectedRow[key] !== event.row[key]) {
      this.isPreviewOn = true;
      this.listColumns = this.listColumnsNoPics;
      this.storedFilterColumns = this.listColumns;
      this.selectedRow = event.row;
      this.mapPositionCenter = (this.selectedRow.connecting_points && isPolygon)
        ? JSON.parse(this.selectedRow.connecting_points).reduce((center, coords, i, allCoords) => {
            if (coords.length) {
              center[0] += +(coords[0] / allCoords.length).toFixed(6);
              center[1] += +(coords[1] / allCoords.length).toFixed(6);
            }
            return center;
          }, [0, 0])
        : [this.selectedRow.latitude, this.selectedRow.longitude];
      this.updateMapData.emit(this.selectedRow[key]);
      this.selectedRowItem.emit(this.selectedRow);

      this.previewImageHandler();
    } else if (this.selectedRow && this.selectedRow[key] === event.row[key]) {
      this.isPreviewOn = false;
      this.listColumns = this.storedColumns;
      this.storedFilterColumns = this.storedColumns;
      this.selectedRow = null;
    }
  }

  public previewImageHandler(): void {
    if (this.selectedRow.pictures_url || this.selectedRow.img_url) {
      this.parkingImages = this.selectedRow.pictures_url ?
        this.selectedRow.pictures_url.split(',').map((url) => ((!!url) ? (url.startsWith('uploads') ?  this.apiEndpoint + '/' + url : url) : '')) :
        this.selectedRow.img_url.split(',').map((url) => ((!!url) ? (url.startsWith('uploads') ?  this.apiEndpoint + '/' + url : url) : ''));
      this.selectedImg = {
        url: this.parkingImages[0],
        i: 0
      };
      this.isImagePreviewOn = true;
      this.isImageZoomOn = true;
    } else {
      this.isImagePreviewOn = false;
    }
  }

  /**
   * onClick photo show it zoomed
   * @param index
   */
  public zoomImage(index: number): void {
    if (index > -1) {
      this.isImageZoomOn = true;
      this.selectedImg = {
        url: this.parkingImages[index],
        i: index
      };
    } else {
      this.isImageZoomOn = false;
      this.selectedImg = null;
    }
  }

  public editColumns() {
    const dialogRef = this.dialog.open(TableColumnsEditModalComponent, {
      width: '550px',
      data : {
        showFields: this.isPreviewOn ? this.listColumnsNoPics : this.listColumns,
        originFields: this.isPreviewOn ? this.storedFilterColumns : this.storedColumns,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.storedFilterColumns = result;
        if (!this.isPreviewOn) {
          this.listColumns = this.storedFilterColumns.filter(field => field.isShow);
        } else {
          this.listColumnsNoPics = this.storedFilterColumns.filter(field => field.isShow);
        }
      }
    });
  }

  public tooltip(row, field_name) {
    if ( field_name === 'zone') {
        return row['zone']? row['zone']['zone_name'] : '';
    } else if (field_name === 'terminal') {
        return row['terminal']['id'] ? row['terminal']['terminal_name'] : '';
    } else {
        return row[field_name];
    }
  }

  /**
   * method for rowClass
   * @param row
   */
  private _defineClass(row): any {
    if (this.selectedRow) {
      if (this.listType === 'Signage' || this.listType === 'Parking meter') {
        return {
          'active': row.codification_id === this.selectedRow.codification_id
        };
      } else {
        return {
          'active': row.id === this.selectedRow.id
        };
      }
    }
  }
}
