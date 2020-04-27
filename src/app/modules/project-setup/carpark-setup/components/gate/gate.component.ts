import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BaseCarparkComponent} from '../base-carpark/base-carpark.component';
import {CarparkItemLevel, CarparkItemType, FormMode, ViewMode} from '../../models/carpark.model';
import {EmptyParking, EmptyParkLevel, EmptyParkZone, EmptyTerminal, Gate, Parking, ParkLevel, ParkZone, Terminal} from '../../models/carpark-items.model';
import {EmptyPrZone, ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import MapOptions from '../../../../../shared/classes/MapOptions';

import {CarparkDataService} from '../../services/carpark-data.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkService} from '../../services/carpark.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {LaneService} from '../../services/lane.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {GateService} from '../../services/gate.service';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import {CarparkAssetsService} from '../../services/carpark-assets.service';
import {ToastrService} from 'ngx-toastr';
import {UploadService} from '../../../../../services/upload.service';

@Component({
  selector: 'app-park-gate',
  templateUrl: './gate.component.html',
  styleUrls: ['./gate.component.scss']
})
export class GateComponent extends BaseCarparkComponent implements OnInit, OnDestroy, OnChanges {
  ViewMode = ViewMode;
  FormMode = FormMode;
  CarparkItemType = CarparkItemType;

  @Input() projectId: number;
  @Input() viewMode: ViewMode;
  @Input() formMode: FormMode;
  @Input() showOptions: string[];
  @Output() changeFormMode = new EventEmitter<FormMode>();

  form: FormGroup;
  imgFiles: File[];
  public options: any;

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
    private readonly router: Router,
    private readonly uploadService: UploadService,
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
    this.options = {
      app: 'web',
      section: 'projects',
      sub: ''
    };

    this.resetMapOptions();
    if (this.selectedGate && this.selectedGate.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);
    }

    this.buildForm();
    this.loadMapData(CarparkItemLevel.Gate, { gate: true }, this.showOptions);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.filter || changes.showOptions) {
      this.loadMapData(CarparkItemLevel.Gate, { gate: true }, this.showOptions);
    }
    if (changes.formMode && this.formMode === FormMode.CREATING) {
      this.resetForm();
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      carpark_zone_id: [this.selectedParkZone ? this.selectedParkZone.id : null, [Validators.required]],
      name_en: [this.selectedGate ? this.selectedGate.name_en : '', [Validators.required]],
      name_ar: [this.selectedGate ? this.selectedGate.name_ar : ''],
      latitude: [this.selectedGate ? this.selectedGate.latitude : '', [Validators.required]],
      longitude: [this.selectedGate ? this.selectedGate.longitude : '', [Validators.required]],
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
      const points = mapdataObj.features[0].geometry.coordinates;
      this.form.controls['latitude'].setValue(points[0]);
      this.form.controls['longitude'].setValue(points[1]);
    } else {
      this.form.controls['latitude'].setValue(0);
      this.form.controls['longitude'].setValue(0);
    }
  }

  async saveGate(gate: Gate) {
    if (this.formValid(this.form, ['perimeter', 'area'])) {
      if (this.formMode === FormMode.UPDATING) {
        gate.id = this.selectedGate.id;
        await this.gateService.update(gate);
        this.toastr.success('The gate is updated successfully!', 'Success!');
        this.gates = this.gates
          .filter(t => t.id !== gate.id)
          .concat([gate as Gate]);
        this.allGates = this.allGates
          .filter(t => t.id !== gate.id)
          .concat([gate as Gate]);
        this.resetForm(FormMode.JUST_UPDATED);
      } else if (this.formMode === FormMode.CREATING) {
        const res = await this.gateService.create(gate);
        gate.id = res.id;
        this.gates.push(gate);
        this.allGates.push(gate);
        this.toastr.success('A gate is created successfully!', 'Success!');
        this.resetForm(FormMode.JUST_CREATED);
      }
    }
  }

  public onSubmit() {
    const gate = this.form.value as Gate;
    if (this.imgFiles && this.imgFiles.length ) {
      this.uploadService.uploadOneByPurpose(this.imgFiles, this.options).subscribe(result => {
        gate.img_url = result;
        this.saveGate(gate);
      });
    } else {
      this.toastr.error('Please upload a image for this gate.', 'Error!');
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
      this.loadMapData(CarparkItemLevel.Gate, { gate: true }, this.showOptions);
    }
  }

  public onTerminalSelection(terminal: Terminal) {
    this.selectedTerminal = terminal === EmptyTerminal
      ? EmptyTerminal // Al Terminals
      : this.terminals.find(v => v.id === terminal.id);

    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Gate, { gate: true }, this.showOptions);
    }
  }

  public onParkingSelection(parking: Parking) {
    this.selectedParking = parking === EmptyParking
      ? EmptyParking // All parkings
      : this.parkings.find(v => v.id === parking.id);

    if (this.selectedParking && this.selectedParking.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Gate, { parkSpace: true }, this.showOptions);
    }
  }

  public onLevelSelection(level: ParkLevel) {
    this.selectedParkLevel = level === EmptyParkLevel
      ? EmptyParkLevel // All parkLevels
      : this.parkLevels.find(v => v.id === level.id);

    if (this.selectedParkLevel && this.selectedParkLevel.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Gate, { parkLevel: false, gate: true }, this.showOptions);
    }
  }

  public onParkZoneSelection(zone: ParkZone) {
    this.selectedParkZone = zone === EmptyParkZone
      ? EmptyParkZone // All parkzones
      : this.parkZones.find(v => v.id === zone.id);

    if (this.selectedParkZone && this.selectedParkZone.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Gate, { parkLevel: false, gate: true }, this.showOptions);
    }
  }

  public onGateSelection(gate: Gate) {
    this.selectedGate = this.gates.find(v => v.id === gate.id);
    if (this.selectedGate && this.selectedGate.id) {
      this.fillUpdateForm();
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Gate, { parkLevel: false, gate: true }, this.showOptions);
    }
  }

  public onCancel() {
    this.resetForm(FormMode.SELECTING);
    this.resetMapOptions();
  }

  private fillUpdateForm() {
    if (this.selectedGate && this.selectedGate.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);

      this.form.reset({
        carpark_zone_id: this.selectedParkZone.id,
        name_en: this.selectedGate.name_en,
        name_ar: this.selectedGate.name_ar,
        latitude: this.selectedGate.latitude,
        longitude: this.selectedGate.longitude,
        img_url: this.selectedGate.img_url
      });
    }
  }

  private resetForm(nextFormMode: FormMode = null) {
    if (nextFormMode !== null) {
      this.formMode = nextFormMode;
      this.changeFormMode.emit(this.formMode);
    }

    this.selectedGate = new Gate();

    this.form.reset({
      carpark_zone_id: this.selectedParkZone.id,
      name_en: '',
      name_ar: '',
      latitude: '',
      longitude: '',
      img_url: ''
    });
    this.removeErrorsFromForm(this.form);
    this.tabMapDrawDataJSON = '';
  }

  async onDeleteCurrentGate(event, gate: Gate) {
    event.stopPropagation();
    try {
      if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
        await this.gateService.delete(gate.id);
        this.toastr.success('The gate has been removed successfully!', 'Success!');
        this.gates = this.gates
          .filter(t => t.id !== gate.id);
        this.allGates = this.allGates
          .filter(t => t.id !== gate.id);
        this.resetForm(FormMode.JUST_DELETED);
      }
    } catch (err) {
      this.APIErrorHandler(err, 'Failed to remove this gate!');
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
    const Icon = this.markerIcon('/assets/project-setup/Gate_selected.svg');
    const marker = { icon: new Icon() };
    const [searchBar, polygon, circle, editing] = [true, false, false, true];
    this.mapOptions = new MapOptions(searchBar, polygon, circle, marker, editing, centerLocation);
  }


  public onImageAdded(event: any) {
    this.imgFiles = event.currentFiles;

    for (let i = 0; i < this.imgFiles.length; i++) {
      let file = this.imgFiles[i];
      let imgFileType = file.type === 'image/x-icon' || file.type.match('image.*')? true : false;

      if (!imgFileType) {
        this.onRemoveResource(i);
        this.toastr.error('Document file format is invalid.', 'Error');
        return;
      }
    }
  }
  public onRemoveResource(index: number) {
    this.imgFiles.splice(index, 1);
  }

  public onRemoveImage() {
    this.selectedGate.img_url = '';
  }
}
