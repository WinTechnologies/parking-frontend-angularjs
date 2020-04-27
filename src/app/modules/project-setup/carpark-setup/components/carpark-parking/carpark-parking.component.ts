import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';

import {BaseCarparkComponent} from '../base-carpark/base-carpark.component';
import {ParkingImageViewComponent} from '../../../common-setup/components/onstreet/onstreet-parking/parking-image-view/parking-image-view.component';
import {EmptyPrZone, ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import {Automated, CarparkType, EmptyTerminal, ManagedByTypes, Parking, Terminal} from '../../models/carpark-items.model';
import {FormMode, ViewMode, CarparkItemType, CarparkItemLevel} from '../../models/carpark.model';
import MapOptions from '../../../../../shared/classes/MapOptions';

import {CarparkDataService} from '../../services/carpark-data.service';
import {CarparkService} from '../../services/carpark.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {GateService} from '../../services/gate.service';
import {LaneService} from '../../services/lane.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import {UploadService} from '../../../../../services/upload.service';
import {ToastrService} from 'ngx-toastr';
import {CarparkAssetsService} from '../../services/carpark-assets.service';

@Component({
  selector: 'app-carpark-parking',
  templateUrl: './carpark-parking.component.html',
  styleUrls: ['./carpark-parking.component.scss']
})
export class CarparkParkingComponent extends BaseCarparkComponent implements OnInit, OnDestroy, OnChanges {
  ViewMode = ViewMode;
  FormMode = FormMode;
  Automated = Automated;
  CarparkItemType = CarparkItemType;

  @Input() projectId: number;
  @Input() viewMode: ViewMode;
  @Input() formMode: FormMode;
  @Input() showOptions: string[];
  @Output() changeFormMode = new EventEmitter<FormMode>();

  form: FormGroup;

  carparkTypes: CarparkType[];
  managedByTypes = ManagedByTypes;

  localFiles: File[] = [];
  // url or base64 string of images
  imageUrls: string[] = [];

  // parking_angles: any[] = [
  //   {text: '0°', value: 0},
  //   {text: '45°', value: 45},
  //   {text: '60°', value: 60},
  //   {text: '90°', value: 90}];
  //
  // dims: any[] = [
  //   {text: '2.4x4.8', w: 2.4, h: 4.8},
  //   {text: '2.6x5', w: 2.6, h: 5},
  //   {text: '2.4x5.4', w: 2.4, h: 5.4},
  //   {text: '3.3x5', w: 3.3, h: 5}
  // ];

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
    private readonly dialog: MatDialog,
    private readonly uploadService: UploadService
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
  public options: any;
  ngOnInit() {
    this.options = {
      app: 'web',
      section: 'projects',
      sub: 'carpark'
    };
    this.resetMapOptions();

    if (this.selectedParking && this.selectedParking.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);
    }

    this.buildForm();
    this.loadMapData(CarparkItemLevel.Parking, { parking: true }, this.showOptions);
    this.carparkService.getAllCarparkTypes()
      .takeUntil(this.destroy$)
      .subscribe(types => this.carparkTypes = types,
        err => this.APIErrorHandler(err, 'Failed to load carpark types!'));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.filter || changes.showOptions) {
      this.loadMapData(CarparkItemLevel.Parking, { parking: true }, this.showOptions);
    }
    if (changes.formMode && this.formMode === FormMode.CREATING) {
      this.resetForm();
      this.carparkService.getParkingCode()
        .subscribe(parkingCode => this.form.controls['code'].setValue(parkingCode),
          err => this.APIErrorHandler(err, 'Failed to generate new parking code!'));
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      project_id: [this.selectedZone ? this.selectedZone.project_id : this.projectId, [Validators.required]],
      zone_id: [this.selectedZone ? this.selectedZone.id : null, [Validators.required]],
      terminal_id: [this.selectedTerminal ? this.selectedTerminal.id : null, [Validators.required]],
      code: [this.selectedParking ? this.selectedParking.code : '', [Validators.required]], // parking_code
      carpark_name: [this.selectedParking ? this.selectedParking.carpark_name : '', [Validators.required]], // name
      name_ar: [this.selectedParking ? this.selectedParking.name_ar : '', [Validators.required]],
      latitude: [this.selectedParking ? this.selectedParking.latitude : '', [Validators.required]],
      longitude: [this.selectedParking ? this.selectedParking.longitude : '', [Validators.required]],
      connecting_points: [this.selectedParking ? this.selectedParking.connecting_points : JSON.stringify([]), [Validators.required]],
      type_id: [this.selectedParking && this.selectedParking.type_id ? this.selectedParking.type_id : 1, [Validators.required]], // parking_type
      managed_by: [this.selectedParking ? this.selectedParking.managed_by : ManagedByTypes[0], [Validators.required]],
      is_automated: [this.selectedParking && this.selectedParking.is_automated ? Automated.Yes : Automated.No, [Validators.required]],
      info_notes: '',
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
                iconUrl: '/assets/project-setup/onstreet/parking.svg',
                iconRetinaUrl: '/assets/project-setup/onstreet/parking.svg',
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
      this.tabMapDrawDataJSON = JSON.stringify(mapdataObj);
    } else {
      this.form.controls['connecting_points'].setValue(JSON.stringify([]));
      this.form.controls['latitude'].setValue(0);
      this.form.controls['longitude'].setValue(0);
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
      this.loadMapData(CarparkItemLevel.Parking, { parking: true }, this.showOptions);
    }
  }

  public onTerminalSelection(terminal: Terminal) {
    this.selectedTerminal = terminal === EmptyTerminal
      ? EmptyTerminal // Al Terminals
      : this.terminals.find(v => v.id === terminal.id);

    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Parking, { parking: true }, this.showOptions);
    }
  }

  public onParkingSelection(parking: Parking) {
    this.selectedParking = this.parkings.find(v => v.id === parking.id);
    if (this.selectedParking && this.selectedParking.id) {
      this.fillUpdateForm();
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Parking, { parking: true }, this.showOptions);
    }
  }

  public onCancel() {
    this.resetForm(FormMode.SELECTING);
    this.resetMapOptions();
  }

  private createParking(parking: Parking) {
    this.carparkService.create(parking)
      .subscribe(res => {
        this.toastr.success('The parking is created successfully!', 'Success!');
        parking.id = res.id;
        this.parkings.push(parking);
        this.allParkings.push(parking);
        this.resetForm(FormMode.JUST_CREATED);
      }, err => this.APIErrorHandler(err, 'Failed to create new carpark!'));
  }

  private updateParking(parking: Parking) {
    parking.id = this.selectedParking.id;
    this.carparkService.update(parking)
      .subscribe(res => {
        this.toastr.success('The parking is updated successfully!', 'Success!');
        this.parkings = this.parkings
          .filter(p => p.id !== parking.id)
          .concat([parking as Parking]);
        this.allParkings = this.allParkings
          .filter(p => p.id !== parking.id)
          .concat([parking as Parking]);
        this.resetForm(FormMode.JUST_UPDATED);
      }, err => this.APIErrorHandler(err, 'Failed to update this carpark!'));
  }

  public onSubmit() {
    // const space_from = this.form.controls['spaces_nbr_from'].value;
    // const space_to = this.form.controls['spaces_nbr_to'].value;
    // if (space_from > space_to) {
    //   this.toastr.warning('"Space no to" should be equal or more than "spaces no to"!', 'Warning!');
    // } else
    if (this.formValid(this.form, ['info_notes', 'is_sensors', 'payment_methods'])) {
      const parking = this.form.value as Parking;

      // add original files
      parking.img_url = this.imageUrls
        .filter((e: string) => e.startsWith('uploads'))
        .join(',');

      if (this.formMode === FormMode.UPDATING) {
        if (this.localFiles && this.localFiles.length) {
          this.uploadService
            .uploadManyByPurpose(this.localFiles, this.options)
            .subscribe(res => {
              // append new local files after successful uploads, remove base64 strings
              this.imageUrls = this.imageUrls.filter((e: string) => e.startsWith('uploads'));
              this.localFiles = [];
              parking.img_url += res.join(',');
              this.updateParking(parking);
            }, err => this.APIErrorHandler(err, 'Failed to upload images!'));
        } else {
          this.updateParking(parking);
        }

      } else if (this.formMode === FormMode.CREATING) {
        if (this.localFiles && this.localFiles.length) {
          this.uploadService
            .uploadManyByPurpose(this.localFiles, this.options)
            .subscribe(res => {
              // append new local files after successful uploads, remove base64 strings
              this.imageUrls = this.imageUrls.filter((e: string) => e.startsWith('uploads'));
              this.localFiles = [];
              parking.img_url += res.join(',');
              this.createParking(parking);
            }, err => this.APIErrorHandler(err, 'Failed to upload images'));
        } else {
          this.createParking(parking);
        }
      }
    } else {
      this.toastr.error('Please fill in the required fields.', 'Error!');
    }
  }

  public onDocumentAdded(event: {file, currentFiles}) {
    this.localFiles.push(event.file);
    if (this.localFiles.length) {
      this.createImageFromBlob(event.file);
    }
  }

  public onDocumentRemoved(event: any) {
    this.localFiles = event.currentFiles;
  }

  // public onRemoveDoc(index: number) {
  //   this.localFiles.splice(index, 1);
  // }

  private createImageFromBlob(image: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.imageUrls.push(reader.result);
      }
    };
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  public onViewAll() {
    const dialogRef = this.dialog.open(ParkingImageViewComponent, {
      width: '760px',
      data: {
        imageUrls: this.imageUrls,
        localFiles: this.localFiles,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.imageUrls = [];
        this.localFiles = [];
        this.imageUrls = result.imageUrls;
        this.localFiles = result.localFiles;
      }
    });
  }

  // private calculateEstSpaces() {
  //   const dim = this.form.controls['parking_dimension'].value;
  //   const find = this.dims.find(v => v.text === dim);
  //   const spaces_from = this.form.controls['spaces_nbr_from'].value;
  //   const spaces_to = this.form.controls['spaces_nbr_to'].value;
  //   let est_count = 0;
  //
  //   if (spaces_from && spaces_to) {
  //     est_count = spaces_to - spaces_from + 1;
  //   } else {
  //     if (find) {
  //       const length = this.form.controls['parking_length'].value;
  //       const angle = this.form.controls['parking_angle'].value;
  //
  //       if (length) {
  //         switch (angle) {
  //           case 0:
  //             est_count = Math.trunc(length / find.h);
  //             break;
  //           case 90:
  //             est_count = Math.trunc(length / find.w);
  //             break;
  //           default:
  //             const w1 = Math.cos(this.rad(angle)) * find.h;
  //             const w2 =  find.w / Math.sin(this.rad(angle));
  //             est_count = Math.trunc((length - w1) / w2);
  //             break;
  //         }
  //       }
  //     }
  //   }
  //   this.form.controls['parking_spaces'].setValue(est_count);
  // }
  //
  // public onChangeDimension() {
  //   this.calculateEstSpaces();
  // }

  private resetForm(nextFormMode: FormMode = null) {
    if (nextFormMode !== null) {
      this.formMode = nextFormMode;
      this.changeFormMode.emit(this.formMode);
    }

    this.selectedParking = new Parking();
    this.form.reset({
      project_id: this.selectedZone ? this.selectedZone.project_id : null,
      zone_id: this.selectedZone ? this.selectedZone.id : null,
      terminal_id: this.selectedTerminal ? this.selectedTerminal.id : null,
      code: '',
      name: '',
      name_ar: '',
      latitude: '',
      longitude: '',
      connecting_points: JSON.stringify([]),
      type_id: 1,
      managed_by: ManagedByTypes[0],
      is_automated: Automated.No,
      info_notes: '',
    });

    this.localFiles = [];
    this.imageUrls = [];

    this.removeErrorsFromForm(this.form);
    this.tabMapDrawDataJSON = '';
  }

  private fillUpdateForm() {
    this.localFiles = [];
    this.imageUrls = [];

    if (this.selectedParking && this.selectedParking.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);

      this.form.reset({
        project_id: this.selectedZone.project_id,
        zone_id: this.selectedZone.id,
        terminal_id: this.selectedTerminal.id,
        code: this.selectedParking.code, // parking_code
        carpark_name: this.selectedParking.carpark_name, // name
        name_ar: this.selectedParking.name_ar,
        latitude: this.selectedParking.latitude,
        longitude: this.selectedParking.longitude,
        connecting_points: JSON.stringify([]),
        type_id: this.selectedParking.type_id ? this.selectedParking.type_id : 1, // parking_type
        managed_by: this.selectedParking.managed_by,
        is_automated: this.selectedParking.is_automated ? Automated.Yes : Automated.No,
        info_notes: '',
      });

      if ( this.selectedParking &&  this.selectedParking.img_url) {
        this.imageUrls = this.selectedParking.img_url.split(',');
      }
    }
  }

  public onDeleteCurrentParking() {
    this.assetService
      .get({ carpark_id: this.selectedParking.id })
      .takeUntil(this.destroy$)
      .subscribe(assets => {
        if (assets && assets[0]) {
          this.toastr.warning('This carpark is linked to assets!', 'Warning!');
        } else {
          if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
            // TODO: Delete Carpark
            this.carparkService.delete(this.selectedParking)
              .takeUntil(this.destroy$)
              .subscribe(() => {
                this.toastr.success('The carpark has been removed successfully!', 'Success!');
                this.parkings = this.parkings
                  .filter(p => p.id !== this.selectedParking.id);
                this.allParkings = this.allParkings
                  .filter(p => p.id !== this.selectedParking.id);
                this.resetForm(FormMode.JUST_DELETED);
              }, err => this.APIErrorHandler(err, 'Failed to remove this carpark!'));
          }
        }
      }, err => this.APIErrorHandler(err, 'Failed to check assets that are linked to this carpark!'));
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
        dashArray: ('10, 10'),
        weight : 3,
      }
    };
    const [searchBar, circle, marker, editing] = [true, false, false, true];
    this.mapOptions = new MapOptions(searchBar, polygon, circle, marker, editing, centerLocation);
  }
}
