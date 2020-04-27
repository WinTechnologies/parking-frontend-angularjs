import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BaseCarparkComponent} from '../base-carpark/base-carpark.component';
import {EmptyPrZone, ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import {EmptyParking, EmptyTerminal, Parking, ParkLevel, Terminal} from '../../models/carpark-items.model';
import {CarparkItemLevel, CarparkItemType, FormMode, ViewMode} from '../../models/carpark.model';
import MapOptions from '../../../../../shared/classes/MapOptions';

import {CarparkDataService} from '../../services/carpark-data.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {UploadService} from '../../../../../services/upload.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkService} from '../../services/carpark.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {GateService} from '../../services/gate.service';
import {LaneService} from '../../services/lane.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {CarparkAssetsService} from '../../services/carpark-assets.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-carpark-level',
  templateUrl: './carpark-level.component.html',
  styleUrls: ['./carpark-level.component.scss']
})
export class CarparkLevelComponent extends BaseCarparkComponent implements OnInit, OnDestroy, OnChanges {
  ViewMode = ViewMode;
  FormMode = FormMode;
  CarparkItemType = CarparkItemType;
  public options: any;

  @Input() projectId: number;
  @Input() viewMode: ViewMode;
  @Input() formMode: FormMode;
  @Input() showOptions: string[];
  @Output() changeFormMode = new EventEmitter<FormMode>();

  form: FormGroup;

  localFile: File;
  imageUrl: string; // base64 string

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

  ngOnInit() {
    this.options = {
      app: 'web',
      section: 'projects',
      sub: 'carpark'
    };
    this.resetMapOptions();
    if (this.selectedParkLevel && this.selectedParkLevel.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);
    }

    this.buildForm();
    this.loadMapData(CarparkItemLevel.Level, { parkLevel: true }, this.showOptions);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filter || changes.showOptions) {
      this.loadMapData(CarparkItemLevel.Level, { parkLevel: true }, this.showOptions);
    }
    if (changes.formMode && this.formMode === FormMode.CREATING) {
      this.resetForm();
      this.carparkLevelService.getLevelCode()
        .subscribe(code => this.form.controls['code'].setValue(code),
          err => this.APIErrorHandler(err, 'Failed to generate new level code!'));
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      project_id: [this.selectedZone ? this.selectedZone.project_id : this.projectId, [Validators.required]],
      zone_id: [this.selectedZone ? this.selectedZone.id : null, [Validators.required]],
      terminal_id: [this.selectedTerminal ? this.selectedTerminal.id : null, [Validators.required]],
      carpark_id: [this.selectedParking ? this.selectedParking.id : null, [Validators.required]],
      code: [this.selectedParkLevel ? this.selectedParkLevel.code : '', [Validators.required]],
      name: [this.selectedParkLevel ? this.selectedParkLevel.name : '', [Validators.required]],
      img_url: this.selectedParkLevel ? this.selectedParkLevel.img_url : '',
      connecting_points: this.selectedParkLevel ? this.selectedParkLevel.connecting_points : JSON.stringify([]),
      n_parking_lots: this.selectedParkLevel ? this.selectedParkLevel.n_parking_lots || 0 : 0,
    });
  }

  public onSiteMapDataChanged(mapdata: any) {
    // TODO: Plan Image
    const mapdataObj = JSON.parse(mapdata);
    if (
      mapdataObj &&
      mapdataObj.features.length > 0 &&
      mapdataObj.features[0].geometry &&
      mapdataObj.features[0].geometry.coordinates
    ) {
      const points = mapdataObj.features[0].geometry.coordinates[0];

    } else {

    }
  }

  public onOverlayDataChanged(event: { type: string, corners?: L.LatLng[] }) {
    if (event.type === 'removed') {
      this.localFile = null;
      this.form.controls['img_url'].setValue('');
      this.imageUrl = null;
    } else if (event.type === 'added') {

    } else if (event.type === 'mouseout') {
      let newCorners: any = event.corners.map(el => [el.lat, el.lng]);
      newCorners = JSON.stringify(newCorners);
      const oldCorners = this.form.controls['connecting_points'].value;
      if (newCorners !== oldCorners) {
        this.form.controls['connecting_points'].setValue(newCorners);
        if (this.formMode === FormMode.UPDATING) {
          this.toastr.info('Please click on UPDATE button to save your modification on the draw');
        }
      }
    }
  }

  public returnToSelection() {
    this.formMode = FormMode.SELECTING;
    this.changeFormMode.emit(this.formMode);
  }

  public onZoneSelection(zone: ProjectZone) {
    this.selectedZone = zone === EmptyPrZone
      ? EmptyPrZone // All Zone
      : this.allZones.find(v => v.id === zone.id);

    if (this.selectedZone && this.selectedZone.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Level, { parkLevel: true }, this.showOptions);
    }
  }

  public onTerminalSelection(terminal: Terminal) {
    this.selectedTerminal = terminal === EmptyTerminal
      ? EmptyTerminal // All Terminal
      : this.terminals.find(v => v.id === terminal.id);

    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Level, { parkLevel: true }, this.showOptions);
    }
  }

  public onParkingSelection(parking: Parking) {
    this.selectedParking = parking === EmptyParking
      ? EmptyParking // All parkings
      : this.parkings.find(v => v.id === parking.id);

    if (this.selectedParking && this.selectedParking.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Level, { parkLevel: true }, this.showOptions);
    }
  }

  public onLevelSelection(level: ParkLevel) {
    this.selectedParkLevel = this.parkLevels.find(v => v.id === level.id);
    if (this.selectedParkLevel && this.selectedParkLevel.id) {
      this.fillUpdateForm();
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Level, { parkLevel: true }, this.showOptions);
    }
  }

  public onCancel() {
    this.resetForm(FormMode.SELECTING);
    this.resetMapOptions();

    // specific only in level component to clean draw when canceling edit or create
    this.loadMapData(CarparkItemLevel.Level, { parkLevel: true }, this.showOptions);
  }

  private updateLevel(level: ParkLevel) {
    level.id = this.selectedParkLevel.id;

    this.carparkLevelService.update(level)
      .takeUntil(this.destroy$)
      .subscribe(res => {
        this.toastr.success('The level is updated successfully!', 'Success!');
        this.parkLevels = this.parkLevels
          .filter(p => p.id !== level.id)
          .concat([level as ParkLevel]);
        if (this.allParkLevels && this.allParkLevels.length) {
          this.allParkLevels = this.allParkLevels
            .filter(p => p.id !== level.id)
            .concat([level as ParkLevel]);
        } else {
          this.allParkLevels = [level];
        }

        this.resetForm(FormMode.JUST_UPDATED);
      }, err => this.APIErrorHandler(err, 'Failed to update this level!'));
  }

  private createLevel(level: ParkLevel) {
    this.carparkLevelService.create(level)
      .takeUntil(this.destroy$)
      .subscribe(res => {
        this.toastr.success('New level is created successfully!', 'Success!');
        level.id = res.id;
        this.parkLevels.push(level);
        if (this.allParkLevels && this.allParkLevels.length) {
          this.allParkLevels.push(level);
        } else {
          this.allParkLevels = [level];
        }
        this.resetForm(FormMode.JUST_CREATED);
      }, err => this.APIErrorHandler(err, 'Failed to create new level!'));
  }

  public onSubmit() {
    if (this.formValid(this.form, ['img_url', 'perimeter', 'area'])) {
      const level = this.form.value as ParkLevel;
      const corners: any[] = JSON.parse(level.connecting_points);
      if (corners.length !== 4 ) {
        console.warn('corner points are invalid');
        return;
      }

      if (this.formMode === FormMode.UPDATING) {
        if (this.localFile) {
          this.uploadService.uploadOneByPurpose([this.localFile], this.options).subscribe(res => {
            level.img_url = res;
            this.form.controls['img_url'].setValue(res);
            this.localFile = null;
            this.updateLevel(level);
          }, err => this.APIErrorHandler(err, 'Failed to upload images!'));
        } else {
          this.updateLevel(level);
        }

      } else if (this.formMode === FormMode.CREATING) {
        if (this.localFile) {
          this.uploadService.uploadOneByPurpose([this.localFile], this.options).subscribe(res => {
            level.img_url = res;
            this.form.controls['img_url'].setValue(res);
            this.localFile = null;
            this.updateLevel(level);
          }, err => this.APIErrorHandler(err, 'Failed to upload images!'));
        } else {
          this.createLevel(level);
        }
      }
    }
  }

  public onDocumentAdded(event: any) {
    if (event.file) {
      this.localFile = event.file;
      this.form.controls['img_url'].setValue(this.localFile.name);
      this.createImageFromBlob(event.file);
    }
  }

  public onDocumentRemoved(event: any) {
    this.localFile = event.currentFiles;
  }

  private createImageFromBlob(image: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.imageUrl = reader.result;
        this.drawLocalImgOverlay(this.imageUrl, true);
      }
    };
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  private fillUpdateForm() {
    if (this.selectedParkLevel && this.selectedParkLevel.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);

      this.form.reset({
        project_id: this.selectedZone.project_id,
        zone_id: this.selectedZone.id,
        terminal_id: this.selectedTerminal.id,
        carpark_id: this.selectedParking.id,
        code: this.selectedParkLevel.code,
        name: this.selectedParkLevel.name,
        img_url: this.selectedParkLevel.img_url,
        connecting_points: this.selectedParkLevel.connecting_points,
        n_parking_lots: this.selectedParkLevel.n_parking_lots || 0,
      });
    }
  }

  private resetForm(nextFormMode: FormMode = null) {
    if (nextFormMode !== null) {
      this.formMode = nextFormMode;
      this.changeFormMode.emit(this.formMode);
    }
    this.selectedParkLevel = new ParkLevel();

    this.form.reset({
      project_id: this.selectedZone.project_id,
      zone_id: this.selectedZone.id,
      terminal_id: this.selectedTerminal.id,
      carpark_id: this.selectedParking.id,
      code: '',
      name: '',
      img_url: this.selectedParkLevel.img_url,
      connecting_points: JSON.stringify([]),
      n_parking_lots: 0,
    });
    this.removeErrorsFromForm(this.form);
    this.tabMapDrawDataJSON = '';
  }

  onDeleteCurrentLevel() {
    // TODO: Delete Level API
    // const zone_code = this.selectedParkLevel.zone_code;
    // forkJoin(
    //   this.assetService.get({zone_code: zone_code}),
    //   this.projectOpenLandService.getWithDetails({zone_id: this.selectedParkLevel.id})
    // ).subscribe(res => {
    //   const [assets, openLands] = res;
    //   if (assets && assets[0]) {
    //     this.toastr.warning('This zone is linked to an Asset!', 'Warning!');
    //   } else if (openLands && openLands[0]) {
    //     this.toastr.warning('This zone is linked to an Open Land!', 'Warning!');
    //   } else {
    //     if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
    //       this.carparkLevelService.delete(this.selectedParkLevel).subscribe(() => {
    //         this.toastr.success('Zone is deleted successfully!', 'Success!');
    //         this.resetForm(FormMode.JUST_DELETED);
    //       }, err => this.APIErrorHandler(err, 'Failed to remove this level!'));
    //     }
    //   }
    // }, err => this.APIErrorHandler(err, 'Failed to check assets that are linked to this level!'));
  }

  /**
   * Update center, zoom-level, reset map options - polygon, icon marker
   *  according to seleceted Zone, Terminal, Carpark, Level, etc
   */
  private  resetMapOptions() {
    /**
     * mapCenter: this.mapCenter, mapZoomValue: this.mapZoomValue
     */
    const { mapCenter, mapZoomValue } = this.moveMapCenterZoom();
    const centerLocation = { lat: mapCenter[0], lng: mapCenter[1] };
    const [searchBar, polygon, circle, marker, editing] = [true, false, false, false, true];
    this.mapOptions = new MapOptions(searchBar, polygon, circle, marker, editing, centerLocation);
  }
}
