import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BaseCarparkComponent} from '../base-carpark/base-carpark.component';
import {CarparkItemLevel, CarparkItemType, FormMode, ViewMode} from '../../models/carpark.model';
import {EmptyParking, EmptyParkLevel, EmptyParkZone, EmptyTerminal, Parking, ParkLevel, ParkSpace, ParkZone, Terminal, VehicleType} from '../../models/carpark-items.model';
import {AreaUnit, EmptyPrZone, LengthUnit, ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import MapOptions from '../../../../../shared/classes/MapOptions';

import {CarparkDataService} from '../../services/carpark-data.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkService} from '../../services/carpark.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {GateService} from '../../services/gate.service';
import {LaneService} from '../../services/lane.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {PgProjectOpenLandService} from '../../../common-setup/services/onstreet/project-openland.service';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import {UploadService} from '../../../../../services/upload.service';
import {ToastrService} from 'ngx-toastr';
import {CarparkAssetsService} from '../../services/carpark-assets.service';

@Component({
  selector: 'app-park-space',
  templateUrl: './park-space.component.html',
  styleUrls: ['./park-space.component.scss']
})
export class ParkSpaceComponent extends BaseCarparkComponent implements OnInit, OnDestroy, OnChanges {
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

  vehicleTypes: VehicleType[];

  imgFiles: File[];
  imageUrl: string; // base64 string
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
    private readonly projectOpenLandService: PgProjectOpenLandService,
    private readonly assetService: PgAssetService,
    private readonly uploadService: UploadService,
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

  async ngOnInit() {
    this.options = {
      app: 'web',
      section: 'projects',
      sub: 'carpark'
    };

    this.resetMapOptions();
    if (this.selectedParkSpace && this.selectedParkSpace.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);
    }

    this.buildForm();
    this.loadMapData(CarparkItemLevel.ParkSpace, { parkLevel: false, parkSpace: true }, this.showOptions);
    this.vehicleTypes = await this.parkSpaceService.getAllVehicleTypes();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.filter || changes.showOptions) {
      this.loadMapData(CarparkItemLevel.ParkSpace, { parkLevel: false, parkSpace: true }, this.showOptions);
    }
    if (changes.formMode && this.formMode === FormMode.CREATING) {
      this.resetForm();
      const parkSpaceCode = await this.parkSpaceService.getCode();
      this.form.controls['code'].setValue(parkSpaceCode);
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      carpark_zone_id: [this.selectedParkZone ? this.selectedParkZone.id : null, [Validators.required]],
      code: [this.selectedParkSpace ? this.selectedParkSpace.code : '', [Validators.required]],
      name: [this.selectedParkSpace ? this.selectedParkSpace.name : '', [Validators.required]],
      for_handicap: [this.selectedParkSpace ? this.selectedParkSpace.for_handicap : '', [Validators.required]],
      is_sensor: [this.selectedParkSpace ? this.selectedParkSpace.is_sensor : '', [Validators.required]],
      vehicle_type_id: [this.selectedParkSpace ? this.selectedParkSpace.vehicle_type_id : '', [Validators.required]],
      latitude: [this.selectedParkSpace ? this.selectedParkSpace.latitude : '', [Validators.required]],
      longitude: [this.selectedParkSpace ? this.selectedParkSpace.longitude : '', [Validators.required]],
      notes: this.selectedParkSpace ? this.selectedParkSpace.notes : '',
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
      this.form.controls['latitude'].setValue('');
      this.form.controls['longitude'].setValue('');
    }
  }

  public onSubmit() {
    const parkSpace = this.form.value as ParkSpace;
    if (this.imgFiles && this.imgFiles.length ) {
      this.uploadService.uploadOneByPurpose(this.imgFiles, this.options).subscribe(result => {
        parkSpace.img_url = result;
        this.saveParkSpace(parkSpace);
      });
    } else {
      this.toastr.error('Please upload a image for this terminal', 'Error!');
    }
  }

  async saveParkSpace(parkSpace: ParkSpace) {
    if (this.formValid(this.form, ['notes'])) {
      if (this.formMode === FormMode.UPDATING) {
        parkSpace.id = this.selectedParkSpace.id;
        await this.parkSpaceService.update(parkSpace);
        this.toastr.success('The park space is updated successfully!', 'Success!');
        this.parkSpaces = this.parkSpaces
          .filter(t => t.id !== parkSpace.id)
          .concat([parkSpace as ParkSpace]);
        this.allParkSpaces = this.allParkSpaces
          .filter(t => t.id !== parkSpace.id)
          .concat([parkSpace as ParkSpace]);
        this.resetForm(FormMode.JUST_UPDATED);
      } else if (this.formMode === FormMode.CREATING) {
        const res = await this.parkSpaceService.create(parkSpace);
        parkSpace.id = res.id;
        this.parkSpaces.push(parkSpace);
        this.allParkSpaces.push(parkSpace);
        this.toastr.success('A park space is created successfully!', 'Success!');
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
      this.loadMapData(CarparkItemLevel.ParkSpace, { parkSpace: true }, this.showOptions);
    }
  }

  public onTerminalSelection(terminal: Terminal) {
    this.selectedTerminal = terminal === EmptyTerminal
      ? EmptyTerminal // Al Terminals
      : this.terminals.find(v => v.id === terminal.id);

    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkSpace, { parkSpace: true }, this.showOptions);
    }
  }

  public onParkingSelection(parking: Parking) {
    this.selectedParking = parking === EmptyParking
      ? EmptyParking // All parkings
      : this.parkings.find(v => v.id === parking.id);

    if (this.selectedParking && this.selectedParking.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkSpace, { parkSpace: true }, this.showOptions);
    }
  }

  public onLevelSelection(level: ParkLevel) {
    this.selectedParkLevel = level === EmptyParkLevel
      ? EmptyParkLevel // All parkLevels
      : this.parkLevels.find(v => v.id === level.id);

    if (this.selectedParkLevel && this.selectedParkLevel.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkSpace, { parkLevel: false, parkSpace: true }, this.showOptions);
    }
  }

  public onParkZoneSelection(zone: ParkZone) {
    this.selectedParkZone = zone === EmptyParkZone
      ? EmptyParkZone // All parkzones
      : this.parkZones.find(v => v.id === zone.id);

    if (this.selectedParkZone && this.selectedParkZone.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkSpace, { parkLevel: false, parkSpace: true }, this.showOptions);
    }
  }

  public onParkSpaceSelection(parkSpace: ParkSpace) {
    this.selectedParkSpace = this.parkSpaces.find(v => v.id === parkSpace.id);
    if (this.selectedParkSpace && this.selectedParkSpace.id) {
      this.fillUpdateForm();
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.ParkSpace, { parkLevel: false, parkSpace: true }, this.showOptions);
    }
  }

  public onCancel() {
    this.resetForm(FormMode.SELECTING);
    this.resetMapOptions();
  }

  private fillUpdateForm() {
    if (this.selectedParkSpace && this.selectedParkSpace.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);

      this.form.reset({
        carpark_zone_id: this.selectedParkZone.id,
        code: this.selectedParkSpace.code,
        name: this.selectedParkSpace.name,
        for_handicap: this.selectedParkSpace.for_handicap,
        is_sensor: this.selectedParkSpace.is_sensor,
        vehicle_type_id: this.selectedParkSpace.vehicle_type_id,
        latitude: this.selectedParkSpace.latitude,
        longitude: this.selectedParkSpace.longitude,
        img_url: this.selectedParkSpace.img_url,
        notes: this.selectedParkSpace.notes,
      });
    }
  }

  private resetForm(nextFormMode: FormMode = null) {
    if (nextFormMode !== null) {
      this.formMode = nextFormMode;
      this.changeFormMode.emit(this.formMode);
    }

    this.selectedParkSpace = new ParkSpace();

    this.form.reset({
      carpark_zone_id: this.selectedParkZone? this.selectedParkZone.id : 0,
      code: '',
      name: '',
      for_handicap: '',
      is_sensor: '',
      vehicle_type_id: '',
      latitude: '',
      longitude: '',
      img_url: '',
      notes: '',
    });
    this.removeErrorsFromForm(this.form);
    this.tabMapDrawDataJSON = '';
  }

  async onDeleteCurrentParkSpace() {
    try {
      if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
        await this.parkSpaceService.delete(this.selectedParkSpace.id);
        this.toastr.success('The park space has been removed successfully!', 'Success!');
        this.parkSpaces = this.parkSpaces
          .filter(t => t.id !== this.selectedParkSpace.id);
        this.allParkSpaces = this.allParkSpaces
          .filter(t => t.id !== this.selectedParkSpace.id);
        this.resetForm(FormMode.JUST_DELETED);
      }
    } catch (err) {
      this.APIErrorHandler(err, 'Failed to remove this park space!');
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
    const [searchBar, circle, polygon, editing] = [true, false, false, true];
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
    this.selectedTerminal.img_url = '';
  }
}
