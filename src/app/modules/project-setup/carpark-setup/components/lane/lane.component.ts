import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BaseCarparkComponent} from '../base-carpark/base-carpark.component';
import {CarparkItemLevel, CarparkItemType, FormMode, ViewMode} from '../../models/carpark.model';
import {EmptyPrZone, ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import {EmptyGate, EmptyParking, EmptyParkLevel, EmptyParkZone, EmptyTerminal, Gate, Lane, Parking, ParkLevel, ParkZone, Terminal} from '../../models/carpark-items.model';
import MapOptions from '../../../../../shared/classes/MapOptions';

import {CarparkDataService} from '../../services/carpark-data.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkService} from '../../services/carpark.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {GateService} from '../../services/gate.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {CarparkAssetsService} from '../../services/carpark-assets.service';
import {LaneService} from '../../services/lane.service';
import {PgProjectOpenLandService} from '../../../common-setup/services/onstreet/project-openland.service';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-park-lane',
  templateUrl: './lane.component.html',
  styleUrls: ['./lane.component.scss']
})
export class LaneComponent extends BaseCarparkComponent implements OnInit, OnDestroy, OnChanges {
  ViewMode = ViewMode;
  FormMode = FormMode;
  CarparkItemType = CarparkItemType;

  @Input() projectId: number;
  @Input() viewMode: ViewMode;
  @Input() formMode: FormMode;
  @Input() showOptions: string[];
  @Output() changeFormMode = new EventEmitter<FormMode>();

  form: FormGroup;

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
    if (this.selectedLane && this.selectedLane.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);
    }

    this.buildForm();
    this.loadMapData(CarparkItemLevel.Lane, { parkLevel: false, lane: true }, this.showOptions);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.filter || changes.showOptions) {
      this.loadMapData(CarparkItemLevel.Lane, { parkLevel: false, lane: true }, this.showOptions);
    }
    if (changes.formMode && this.formMode === FormMode.CREATING) {
      this.resetForm();
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      gate_id: [this.selectedGate ? this.selectedGate.id : null, [Validators.required]],
      name_en: [this.selectedLane ? this.selectedLane.name_en : '', [Validators.required]],
      name_ar: [this.selectedLane ? this.selectedLane.name_ar : ''],
      latitude: [this.selectedLane ? this.selectedLane.latitude : '', [Validators.required]],
      longitude: [this.selectedLane ? this.selectedLane.longitude : '', [Validators.required]],
      connecting_points: [this.selectedLane ? this.selectedLane.connecting_points : JSON.stringify([]), [Validators.required]]
    });
  }

  public onSiteMapDataChanged(mapdata: any) {
    const mapdataObj = JSON.parse(mapdata);
    if (
      mapdataObj &&
      mapdataObj.features.length > 0 &&
      mapdataObj.features[0].geometry &&
      mapdataObj.features[0].geometry.coordinates
    ) {
      /*
        mapdataObj.features[0]: Coordinate Info
        mapdataObj.features[1]: Center lat, lng Info
       */
      let center_point;
      const points = mapdataObj.features[0].geometry.coordinates[0];

      // Before adding centroid point of Polygon
      if (mapdataObj.features.length === 1) {
        // Init Centroid point of polygon
        center_point = points[0];
        if (points.length > 3) {
          center_point[0] = points[0][0] + (points[1][0] - points[0][0]) / 2;
          center_point[1] = points[0][1] + (points[1][1] - points[0][1]) / 2;
        }
        const centerMarker = {
          type: 'Feature',
          properties: {
            options: { icon: { options: {
                  iconUrl: '/assets/project-setup/Lane_active.svg',
                  iconRetinaUrl: '/assets/project-setup/Lane_active.svg',
                  iconSize: [48, 48],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  tooltipAnchor: [16, -28],
                  shadowSize: [48, 48]
                }, _initHooksCalled: true } },
          },
          geometry: {
            type: 'Point',
            coordinates: center_point
          }
        };
        mapdataObj.features.push(centerMarker);

        // After adding centroid point of Polygon
      } else if (mapdataObj.features.length === 2) {
        center_point = mapdataObj.features[1].geometry.coordinates;
      }
      this.form.controls['connecting_points'].setValue(JSON.stringify(points));
      this.form.controls['latitude'].setValue(center_point[0]);
      this.form.controls['longitude'].setValue(center_point[1]);

    } else {
      this.form.controls['connecting_points'].setValue(JSON.stringify([]));
      this.form.controls['latitude'].setValue(0);
      this.form.controls['longitude'].setValue(0);
    }
  }

  async onSubmit() {
    const lane = this.form.value as Lane;
    if (this.formValid(this.form, ['perimeter', 'area'])) {
      if (this.formMode === FormMode.UPDATING) {
        lane.id = this.selectedLane.id;
        await this.laneService.update(lane);
        this.toastr.success('The lane is updated successfully!', 'Success!');
        this.lanes = this.lanes
          .filter(t => t.id !== lane.id)
          .concat([lane as Lane]);
        this.allLanes = this.allLanes
          .filter(t => t.id !== lane.id)
          .concat([lane as Lane]);
        this.resetForm(FormMode.JUST_UPDATED);
      } else if (this.formMode === FormMode.CREATING) {
        const res = await this.laneService.create(lane);
        lane.id = res.id;
        this.lanes.push(lane);
        this.allLanes.push(lane);
        this.toastr.success('A lane is created successfully!', 'Success!');
        this.resetForm(FormMode.JUST_CREATED);
      }
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
      this.loadMapData(CarparkItemLevel.Lane, { lane: true }, this.showOptions);
    }
  }

  public onTerminalSelection(terminal: Terminal) {
    this.selectedTerminal = terminal === EmptyTerminal
      ? EmptyTerminal // Al Terminals
      : this.terminals.find(v => v.id === terminal.id);

    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Lane, { lane: true }, this.showOptions);
    }
  }

  public onParkingSelection(parking: Parking) {
    this.selectedParking = parking === EmptyParking
      ? EmptyParking // All parkings
      : this.parkings.find(v => v.id === parking.id);

    if (this.selectedParking && this.selectedParking.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Lane, { lane: true }, this.showOptions);
    }
  }

  public onLevelSelection(level: ParkLevel) {
    this.selectedParkLevel = level === EmptyParkLevel
      ? EmptyParkLevel // All parkLevels
      : this.parkLevels.find(v => v.id === level.id);

    if (this.selectedParkLevel && this.selectedParkLevel.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Lane, { parkLevel: false, lane: true }, this.showOptions);
    }
  }

  public onParkZoneSelection(zone: ParkZone) {
    this.selectedParkZone = zone === EmptyParkZone
      ? EmptyParkZone // All parkzones
      : this.parkZones.find(v => v.id === zone.id);

    if (this.selectedParkZone && this.selectedParkZone.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Lane, { parkLevel: false, lane: true }, this.showOptions);
    }
  }

  public onGateSelection(gate: Gate) {
    this.selectedGate = gate === EmptyGate
      ? EmptyGate // All gates
      : this.gates.find(v => v.id === gate.id);

    if (this.selectedGate && this.selectedGate.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Lane, { parkLevel: false, lane: true }, this.showOptions);
    }
  }

  public onLaneSelection(lane: Lane) {
    this.selectedLane = this.lanes.find(v => v.id === lane.id);
    if (this.selectedLane && this.selectedLane.id) {
      this.fillUpdateForm();
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Lane, { parkLevel: false, lane: true }, this.showOptions);
    }
  }

  public onCancel() {
    this.resetForm(FormMode.SELECTING);
    this.resetMapOptions();
  }

  private fillUpdateForm() {
    if (this.selectedLane && this.selectedLane.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);

      this.form.reset({
        gate_id: this.selectedGate.id,
        name_en: this.selectedLane.name_en,
        name_ar: this.selectedLane.name_ar,
        latitude: this.selectedLane.latitude,
        longitude: this.selectedLane.longitude,
        connecting_points: this.selectedLane.connecting_points
      });
    }
  }

  private resetForm(nextFormMode: FormMode = null) {
    if (nextFormMode !== null) {
      this.formMode = nextFormMode;
      this.changeFormMode.emit(this.formMode);
    }

    this.selectedLane = new Lane();

    this.form.reset({
      gate_id: this.selectedGate.id,
      name_en: '',
      name_ar: '',
      latitude: '',
      longitude: '',
      connecting_points: JSON.stringify([]),
      img_url: ''
    });
    this.removeErrorsFromForm(this.form);
    this.tabMapDrawDataJSON = '';
  }

  async onDeleteCurrentLane(event, lane: Lane) {
    event.stopPropagation();
    try {
      if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
        await this.laneService.delete(lane.id);
        this.toastr.success('The lane has been removed successfully!', 'Success!');
        this.lanes = this.lanes
          .filter(t => t.id !== lane.id);
        this.allLanes = this.allLanes
          .filter(t => t.id !== lane.id);
        this.resetForm(FormMode.JUST_DELETED);
      }
    } catch (err) {
      this.APIErrorHandler(err, 'Failed to remove this lane!');
    }
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
