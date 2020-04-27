import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BaseCarparkComponent} from '../base-carpark/base-carpark.component';
import {ProjectZone, LengthUnit, AreaUnit, EmptyPrZone} from '../../../common-setup/models/onstreet/project_zone.model';
import {EmptyParking, EmptyParkLevel, EmptyTerminal, Parking, ParkLevel, ParkZone, Terminal} from '../../models/carpark-items.model';
import {CarparkItemLevel, CarparkItemType, FormMode, ViewMode} from '../../models/carpark.model';
import MapOptions from '../../../../../shared/classes/MapOptions';

import {CarparkDataService} from '../../services/carpark-data.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkService} from '../../services/carpark.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {GateService} from '../../services/gate.service';
import {LaneService} from '../../services/lane.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import {ToastrService} from 'ngx-toastr';
import {CarparkAssetsService} from '../../services/carpark-assets.service';

@Component({
  selector: 'app-carpark-zone',
  templateUrl: './carpark-zone.component.html',
  styleUrls: ['./carpark-zone.component.scss']
})
export class CarparkZoneComponent extends BaseCarparkComponent implements OnInit, OnDestroy, OnChanges {
  ViewMode = ViewMode;
  FormMode = FormMode;
  LengthUnit = LengthUnit;
  CarparkItemType = CarparkItemType;

  @Input() projectId: number;
  @Input() viewMode: ViewMode;
  @Input() formMode: FormMode;
  @Input() showOptions: string[];
  @Output() changeFormMode = new EventEmitter<FormMode>();

  form: FormGroup;

  tempArea: number;
  tempPerimeter: number;

  constructor(
    dataService: CarparkDataService,
    terminalService: TerminalService,
    carparkService: CarparkService,
    carparkLevelService: CarparkLevelService,
    carparkZoneService: CarparkZoneService,
    gateService: GateService,
    laneService: LaneService,
    parkSpaceService: ParkSpaceService,
    carparkAssetsService: CarparkAssetsService,
    toastr: ToastrService,
    private readonly formBuilder: FormBuilder,
    private readonly assetService: PgAssetService,
    private readonly router: Router
  ) {
    super(
      dataService,
      terminalService,
      carparkService,
      carparkLevelService,
      carparkZoneService,
      gateService,
      laneService,
      parkSpaceService,
      carparkAssetsService,
      toastr,
    );
  }

  ngOnInit() {
    this.resetMapOptions();
    if (this.selectedParkZone && this.selectedParkZone.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);
      this.setTempAreaPerimeter(this.selectedParkZone);
    }

    this.buildForm();
    this.loadMapData(CarparkItemLevel.ParkZone, { parkLevel: false, parkZone: true }, this.showOptions);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.filter || changes.showOptions) {
      this.loadMapData(CarparkItemLevel.ParkZone, { parkLevel: false, parkZone: true }, this.showOptions);
    }
    if (changes.formMode && this.formMode === FormMode.CREATING) {
      this.resetForm();
      // const zoneCode = await this.carparkZoneService.getZoneCode();
      // this.form.controls['zone_code'].setValue(zoneCode);
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      project_id: [this.selectedZone ? this.selectedZone.project_id : this.projectId, [Validators.required]],
      zone_id: [this.selectedZone ? this.selectedZone.id : null, [Validators.required]],
      terminal_id: [this.selectedTerminal ? this.selectedTerminal.id : null, [Validators.required]],
      carpark_id: [this.selectedParking ? this.selectedParking.id : null, [Validators.required]],
      level_id: [this.selectedParkLevel ? this.selectedParkLevel.id : null, [Validators.required]],
      name_en: [this.selectedParkZone ? this.selectedParkZone.name_en : '', [Validators.required]],
      name_ar: [this.selectedParkZone ? this.selectedParkZone.name_ar : '', [Validators.required]],
      area: [this.selectedParkZone ? this.selectedParkZone.area : 0, [Validators.required]],
      perimeter: [this.selectedParkZone ? this.selectedParkZone.perimeter : 0, [Validators.required]],
      measurement_unit: [this.selectedParkZone ? this.selectedParkZone.measurement_unit : LengthUnit.Meters, [Validators.required]],
      area_units: [this.selectedParkZone && this.selectedParkZone.measurement_unit ===  LengthUnit.Kilometers
        ? AreaUnit.SQ_Kilometers
        : AreaUnit.SQ_Meters,
        [Validators.required]
      ],
      n_parking_lots: [this.selectedParkZone ? this.selectedParkZone.n_parking_lots || 0 : 0, [Validators.required]],
      connecting_points: [this.selectedParkZone ? this.selectedParkZone.connecting_points : JSON.stringify([]), [Validators.required]],
    });
  }

  private setTempAreaPerimeter(zone: ParkZone) {
    if (zone.measurement_unit === LengthUnit.Kilometers) {
      this.tempArea = zone.area * 1000 * 1000;
      this.tempPerimeter = zone.perimeter * 1000;
    } else if (zone.measurement_unit === LengthUnit.Meters) {
      this.tempArea = zone.area;
      this.tempPerimeter = zone.perimeter;
    }
  }

  public onSiteMapDataChanged(mapdata: any) {
    const mapdataObj = JSON.parse(mapdata);
    if (
      mapdataObj &&
      mapdataObj.features.length > 0 &&
      mapdataObj.features[0].geometry &&
      mapdataObj.features[0].geometry.coordinates
    ) {
      const points = mapdataObj.features[0].geometry.coordinates[0];
      this.tempArea = Math.round(this.ringArea(points));
      this.tempPerimeter = Math.round(this.distanceInArea(points));

      this.form.controls['connecting_points'].setValue(JSON.stringify(points));

      if (this.form.controls['measurement_unit'].value === LengthUnit.Kilometers) {
        this.form.controls['area'].setValue((this.tempArea / 1000 / 1000).toFixed(3));
        this.form.controls['perimeter'].setValue((this.tempPerimeter / 1000).toFixed(3));

      } else if (this.form.controls['measurement_unit'].value === LengthUnit.Meters) {
        this.form.controls['area'].setValue(this.tempArea);
        this.form.controls['perimeter'].setValue(this.tempPerimeter);
      }
    } else {
      this.tempArea = 0;
      this.tempPerimeter = 0;

      this.form.controls['connecting_points'].setValue(JSON.stringify([]));
      this.form.controls['area'].setValue(0);
      this.form.controls['perimeter'].setValue(0);
    }
  }

  public returnToSelection() {
    this.formMode = FormMode.SELECTING;
    this.changeFormMode.emit(this.formMode);
  }

  public onZoneSelection(zone: ProjectZone) {
    this.selectedZone = zone === EmptyPrZone
      ? EmptyPrZone // All Zones
      : this.allZones.find(v => v.id === zone.id);

    if (this.selectedZone && this.selectedZone.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkZone, { parkZone: true }, this.showOptions);
    }
  }

  public onTerminalSelection(terminal: Terminal) {
    this.selectedTerminal = terminal === EmptyTerminal
      ? EmptyTerminal // Al Terminals
      : this.terminals.find(v => v.id === terminal.id);

    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkZone, { parkZone: true }, this.showOptions);
    }
  }

  public onParkingSelection(parking: Parking) {
    this.selectedParking = parking === EmptyParking
      ? EmptyParking // All parkings
      : this.parkings.find(v => v.id === parking.id);

    if (this.selectedParking && this.selectedParking.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkZone, { parkZone: true }, this.showOptions);
    }
  }

  public onLevelSelection(level: ParkLevel) {
    this.selectedParkLevel = level === EmptyParkLevel
      ? EmptyParkLevel // All parkLevels
      : this.parkLevels.find(v => v.id === level.id);

    if (this.selectedParkLevel && this.selectedParkLevel.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkZone, { parkLevel: false, parkZone: true }, this.showOptions);
    }
  }

  public onParkZoneSelection(level: ParkLevel) {
    this.selectedParkZone = this.parkZones.find(v => v.id === level.id);
    if (this.selectedParkZone && this.selectedParkZone.id) {
      this.fillUpdateForm();
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkZone, { parkLevel: false, parkZone: true }, this.showOptions);
    }
  }

  public onCancel() {
    this.resetForm(FormMode.SELECTING);
    this.resetMapOptions();
  }

  private async updateParkZone(zone: ParkZone) {
    try {
      zone.id = this.selectedParkZone.id;
      await this.carparkZoneService.update(zone);
      this.toastr.success('The park zone is updated successfully!', 'Success!');
      this.parkZones = this.parkZones
        .filter(p => p.id !== zone.id)
        .concat([zone as ParkZone]);
      if (this.allParkZones && this.allParkZones.length) {
        this.allParkZones = this.allParkZones
          .filter(p => p.id !== zone.id)
          .concat([zone as ParkZone]);
      } else {
        this.allParkZones = [zone];
      }
      this.resetForm(FormMode.JUST_UPDATED);
    } catch (err) {
      this.APIErrorHandler(err, 'Failed to update this park zone!');
    }
  }

  private async createParkZone(zone: ParkZone) {
    try {
      zone.id = this.selectedParkZone.id;
      const res = await this.carparkZoneService.create(zone);
      this.toastr.success('New park zone is created successfully!', 'Success!');
      zone.id = res.id;
      this.parkZones.push(zone);
      if (this.allParkZones && this.allParkZones.length) {
        this.allParkZones.push(zone);
      } else {
        this.allParkZones = [zone];
      }

      this.resetForm(FormMode.JUST_CREATED);
    } catch (err) {
      this.APIErrorHandler(err, 'Failed to create new park zone!');
    }
  }

  public onSubmit() {
    if (this.formValid(this.form, ['img_url', 'perimeter', 'area'])) {
      let parkZone: ParkZone;
      parkZone = this.form.value as ParkZone;

      if (parkZone.measurement_unit === LengthUnit.Kilometers) {
        parkZone.area = this.tempArea / 1000 / 1000;
        parkZone.perimeter = this.tempPerimeter / 1000;
      } else if (parkZone.measurement_unit === LengthUnit.Meters) {
        parkZone.area = this.tempArea;
        parkZone.perimeter = this.tempPerimeter;
      }

      if (this.formMode === FormMode.UPDATING) {
        // TODO: Image upload
        this.updateParkZone(parkZone);

      } else if (this.formMode === FormMode.CREATING) {
        // TODO: Image upload
        this.createParkZone(parkZone);
      }
    }
  }

  public onChangeUnit(value: string) {
    if (value === LengthUnit.Kilometers) {
      this.form.controls['area_units'].setValue(AreaUnit.SQ_Kilometers);
      this.form.controls['area'].setValue((this.tempArea / 1000 / 1000).toFixed(3));
      this.form.controls['perimeter'].setValue((this.tempPerimeter / 1000).toFixed(3));
    } else if (value === LengthUnit.Meters) {
      this.form.controls['area_units'].setValue(AreaUnit.SQ_Meters);
      this.form.controls['area'].setValue(this.tempArea);
      this.form.controls['perimeter'].setValue(this.tempPerimeter);
    }
  }

  private fillUpdateForm() {
    if (this.selectedParkZone && this.selectedParkZone.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);

      this.form.reset({
        project_id: this.selectedZone.project_id,
        zone_id: this.selectedZone.id,
        terminal_id: this.selectedTerminal.id,
        carpark_id: this.selectedParking.id,
        level_id: this.selectedParkLevel.id,
        name_en: this.selectedParkZone.name_en,
        name_ar: this.selectedParkZone.name_ar,
        area: this.selectedParkZone.area,
        perimeter: this.selectedParkZone.perimeter,
        measurement_unit: this.selectedParkZone.measurement_unit,
        area_units: `Sq ${this.selectedParkZone.measurement_unit}`,
        n_parking_lots: this.selectedParkZone.n_parking_lots || 0,
        connecting_points: this.selectedParkZone.connecting_points,
      });

      this.setTempAreaPerimeter(this.selectedParkZone);
    }
  }

  private resetForm(nextFormMode: FormMode = null) {
    if (nextFormMode !== null) {
      this.formMode = nextFormMode;
      this.changeFormMode.emit(this.formMode);
    }

    this.selectedParkZone = new ParkZone();

    this.form.reset({
      project_id: this.selectedZone.project_id,
      zone_id: this.selectedZone.id,
      terminal_id: this.selectedTerminal.id,
      carpark_id: this.selectedParking.id,
      level_id: this.selectedParkLevel.id,
      name_en: '',
      name_ar: '',
      area: 0,
      perimeter: 0,
      measurement_unit: LengthUnit.Meters,
      area_units: AreaUnit.SQ_Meters,
      n_parking_lots: 0,
      connecting_points: JSON.stringify([]),
    });
    this.removeErrorsFromForm(this.form);
    this.tabMapDrawDataJSON = '';
  }

  onDeleteCurrentZone() {
    this.assetService
      .get({zone_id: this.selectedParkZone.id})
      .takeUntil(this.destroy$)
      .subscribe(async assets => {
        if (assets && assets[0]) {
          this.toastr.warning('This zone is linked to assets!', 'Warning!');
        } else {
          try {
            if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
              await this.carparkZoneService.delete(this.selectedParkZone.id);
              this.toastr.success('The park zone has been removed successfully!', 'Success!');
              this.allParkZones = this.allParkZones
                .filter(z => z.id !== this.selectedParkZone.id);
              this.resetForm(FormMode.JUST_DELETED);
            }
          } catch (err) {
            this.APIErrorHandler(err, 'Failed to remove this park zone!');
          }
        }
      }, err => this.APIErrorHandler(err, 'Failed to check assets that are linked to this park zone!'));
  }

  /**
   * Update center, zoom-level, reset map options - polygon, icon marker
   *  according to seleceted Zone, Terminal, Carpark, Level, etc
   */
  private resetMapOptions() {
    /**
     * mapCenter: this.mapCenter, mapZoomValue: this.mapZoomValue
     */
    const { mapCenter, mapZoomValue } = this.moveMapCenterZoom();
    const centerLocation = { lat: mapCenter[0], lng: mapCenter[1] };
    const polygon = {
      shapeOptions: {
        color: 'orange',
        fillOpacity: 0,
        weight : 3,
      }
    };
    const [searchBar, circle, marker, editing] = [true, false, false, true];
    this.mapOptions = new MapOptions(searchBar, polygon, circle, marker, editing, centerLocation);
  }
}
