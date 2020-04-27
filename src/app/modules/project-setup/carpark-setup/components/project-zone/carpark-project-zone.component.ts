import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BaseCarparkComponent} from '../base-carpark/base-carpark.component';
import {AreaUnit, LengthUnit, ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import {CarparkItemLevel, CarparkItemType, FormMode, ViewMode} from '../../models/carpark.model';
import MapOptions from '../../../../../shared/classes/MapOptions';

import {CarparkDataService} from '../../services/carpark-data.service';
import {PgProjectZoneService} from '../../../common-setup/services/onstreet/project-zone.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkService} from '../../services/carpark.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {GateService} from '../../services/gate.service';
import {LaneService} from '../../services/lane.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {PgProjectOpenLandService} from '../../../common-setup/services/onstreet/project-openland.service';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import {ToastrService} from 'ngx-toastr';
import {CarparkAssetsService} from '../../services/carpark-assets.service';

@Component({
  selector: 'app-carpark-project-zone',
  templateUrl: './carpark-project-zone.component.html',
  styleUrls: ['./carpark-project-zone.component.scss']
})
export class CarparkProjectZoneComponent extends BaseCarparkComponent implements OnInit, OnDestroy, OnChanges {
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
    private readonly projectZoneService: PgProjectZoneService,
    private readonly projectOpenLandService: PgProjectOpenLandService,
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
    if (this.selectedZone && this.selectedZone.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);
      this.setTempAreaPerimeter(this.selectedZone);
    }

    this.buildForm();
    this.getAllItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filter || changes.showOptions) {
      this.loadMapData(CarparkItemLevel.Zone, {zone: true}, this.showOptions);
    }
    if (changes.formMode && this.formMode === FormMode.CREATING) {
      this.resetForm();
      // this.projectZoneService.getZoneCode does not work without project id
      this.projectZoneService.getZoneCode({project_id: this.projectId})
        .takeUntil(this.destroy$)
        .subscribe(zone_code => {
          this.form.controls['zone_code'].setValue(zone_code);
        });
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      project_id: [this.projectId, [Validators.required]],
      zone_code: [this.selectedZone ? this.selectedZone.zone_code : '', [Validators.required]],
      zone_name: [this.selectedZone ? this.selectedZone.zone_name : '', [Validators.required]],
      zone_name_ar: [this.selectedZone ? this.selectedZone.zone_name_ar : '', [Validators.required]],
      perimeter: this.selectedZone ? this.selectedZone.perimeter : 0,
      area: this.selectedZone ? this.selectedZone.area : 0,
      measurement_unit: [this.selectedZone ? this.selectedZone.measurement_unit : LengthUnit.Meters, [Validators.required]],
      area_units: [this.selectedZone && this.selectedZone.measurement_unit ===  LengthUnit.Kilometers
        ? AreaUnit.SQ_Kilometers
        : AreaUnit.SQ_Meters,
        [Validators.required]
      ],
      connecting_points: [this.selectedZone ? this.selectedZone.connecting_points : JSON.stringify([]), [Validators.required]],
    });
  }

  private setTempAreaPerimeter(zone: ProjectZone) {
    if (zone.measurement_unit === LengthUnit.Kilometers) {
      this.tempArea = zone.area * 1000 * 1000;
      this.tempPerimeter = zone.perimeter * 1000;
    } else if (zone.measurement_unit === LengthUnit.Meters) {
      this.tempArea = zone.area;
      this.tempPerimeter = zone.perimeter;
    }
  }

  private getAllItems() {
    if (this.allZones && this.allZones.length >= 0) {
      this.loadMapData(CarparkItemLevel.Zone, {zone: true}, this.showOptions);
    } else {
      this.projectZoneService.get({ project_id: this.projectId })
        .takeUntil(this.destroy$)
        .subscribe(allZones => {
          this.allZones = allZones;
          this.loadMapData(CarparkItemLevel.Zone, {zone: true}, this.showOptions);
        });
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

  public onSubmit() {
    const {area_units, ...zone} = this.form.value;
    if (zone.measurement_unit === LengthUnit.Kilometers) {
      zone.area = this.tempArea / 1000 / 1000;
      zone.perimeter = this.tempPerimeter / 1000;
    } else if (zone.measurement_unit === LengthUnit.Meters) {
      zone.area = this.tempArea;
      zone.perimeter = this.tempPerimeter;
    }

    if (this.formValid(this.form, ['perimeter', 'area'])) {
      if (this.formMode === FormMode.UPDATING) {
        zone.id = this.selectedZone.id;
        this.projectZoneService.update(zone)
          .takeUntil(this.destroy$)
          .subscribe(res => {
            this.toastr.success('Zone is updated successfully!', 'Success!');
            this.allZones = this.allZones
              .filter(z => z.id !== zone.id)
              .concat([zone as ProjectZone]);
            this.resetForm(FormMode.JUST_UPDATED);
          });
      } else if (this.formMode === FormMode.CREATING) {
        this.projectZoneService.create(zone)
          .takeUntil(this.destroy$)
          .subscribe(res => {
            this.toastr.success('Zone is created successfully!', 'Success!');
            zone.id = res.id;
            this.allZones.push(zone);
            this.resetForm(FormMode.JUST_CREATED);
          });
      }
    }
  }

  public returnToSelection() {
    this.formMode = FormMode.SELECTING;
    this.changeFormMode.emit(this.formMode);
  }

  public onZoneSelection(zone: ProjectZone) {
    this.selectedZone = this.allZones.find(v => v.id === zone.id);
    if (this.selectedZone && this.selectedZone.id) {
      this.fillUpdateForm();
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Zone, {zone: true}, this.showOptions);
    }
  }

  public onCancel() {
    this.resetForm(FormMode.SELECTING);
    this.resetMapOptions();
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
    if (this.selectedZone && this.selectedZone.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);

      this.form.reset({
        project_id: this.projectId,
        zone_code: this.selectedZone.zone_code,
        zone_name: this.selectedZone.zone_name,
        zone_name_ar: this.selectedZone.zone_name_ar,
        perimeter: this.selectedZone.perimeter,
        area: this.selectedZone.area,
        measurement_unit: this.selectedZone.measurement_unit,
        area_units: `Sq ${this.selectedZone.measurement_unit}`,
        connecting_points: this.selectedZone.connecting_points,
      });

      this.setTempAreaPerimeter(this.selectedZone);
    }
  }

  private resetForm(nextFormMode: FormMode = null) {
    if (nextFormMode !== null) {
      this.formMode = nextFormMode;
      this.changeFormMode.emit(this.formMode);
    }

    this.selectedZone = new ProjectZone();

    this.form.reset({
      project_id: this.projectId,
      zone_code: '',
      zone_name: '',
      zone_name_ar: '',
      area: 0,
      perimeter: 0,
      measurement_unit: LengthUnit.Meters,
      area_units: AreaUnit.SQ_Meters,
      connecting_points: JSON.stringify([])
    });
    this.removeErrorsFromForm(this.form);
    this.tabMapDrawDataJSON = '';
    this.getAllItems();
  }

  onDeleteCurrentZone() {
    this.assetService
      .get({zone_id: this.selectedZone.id})
      .takeUntil(this.destroy$)
      .subscribe(assets => {
        if (assets && assets[0]) {
          this.toastr.warning('This zone is linked to assets!', 'Warning!');
        } else {
          if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
            this.projectZoneService.delete(this.selectedZone)
              .takeUntil(this.destroy$)
              .subscribe(res => {
                this.toastr.success('The zone has been removed successfully!', 'Success!');
                this.allZones = this.allZones
                  .filter(z => z.id !== this.selectedZone.id);
                this.resetForm(FormMode.JUST_DELETED);
              }, err => this.APIErrorHandler(err, 'Failed to remove this zone!'));
          }
        }
      }, err => this.APIErrorHandler(err, 'Failed to check assets that are linked to this zone!'));
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
    const polygon: any = {
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
