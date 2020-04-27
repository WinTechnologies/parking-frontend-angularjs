import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import MapOptions from '../../../../../../shared/classes/MapOptions';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Parking} from '../../../models/onstreet/parking.model';
import {PgParkingsService} from '../../../services/onstreet/parking.service';
import {ToastrService} from 'ngx-toastr';
import {MatDialog} from '@angular/material';
import {ParkingImageViewComponent} from './parking-image-view/parking-image-view.component';
import {ProjectZone} from '../../../models/onstreet/project_zone.model';
import {UploadService} from '../../../../../../services/upload.service';
import {BaseOnStreetComponent} from '../base-onstreet/base-onstreet.component';
import {PgProjectZoneService} from '../../../services/onstreet/project-zone.service';
import {forkJoin} from 'rxjs';
import {NotificationService} from '../../../services/onstreet/notification.service';
@Component({
  selector: 'app-onstreet-parking',
  templateUrl: './parking.component.html',
  styleUrls: ['./parking.component.scss']
})
export class ParkingComponent extends BaseOnStreetComponent implements OnInit, OnChanges {
  @Input() projectId: number;
  @Input() filter: string;
  @Input() mapCenter: any;
  @Input() isListViewOn: boolean;

  docFiles: File[] = [];
  form: FormGroup;
  parking_angles: any[] = [
    {text: '0°', value: 0},
    {text: '45°', value: 45},
    {text: '60°', value: 60},
    {text: '90°', value: 90}];

  dims: any[] = [
    {text: '2.4x4.8', w: 2.4, h: 4.8},
    {text: '2.6x5', w: 2.6, h: 5},
    {text: '2.4x5.4', w: 2.4, h: 5.4},
    {text: '3.3x5', w: 3.3, h: 5}
  ];
  public options: any;
  parking_types: any[] = ['Commercial', 'Mixed', 'Residential', 'Unmanaged'];
  managed_by_types: any[] = ['Mawgif', 'Unmanaged'];
  mapOptions: MapOptions;

  mapdata = '';
  mapdrawdata = '';
  imageUrls: string[] = [] ;
  pictures: string[] = [] ;
  coords: any[] = [];
  parking: Parking;
  currentParking: Parking;
  public zones: ProjectZone[];
  public allZones: ProjectZone[];
  public mapPositionCenter: any;
  public parkingImages: string[];
  public selectedImg: any;
  public isImageZoomOn = false;
  paymentMethods: any[];
  paymentMethodSelected: any[];

  public parkingWithZones: any[];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly parkingService: PgParkingsService,
    private readonly projectZoneService: PgProjectZoneService,
    private readonly dialog: MatDialog,
    private readonly uploadService: UploadService,
    private readonly toastr: ToastrService,
    private readonly notification: NotificationService,
  ) {
    super();
  }
  ngOnInit() {
    this.options = {
        app: 'web',
        section: 'projects',
        sub: 'onStreet'
    };
    this.mapOptions = new MapOptions(true, {
      shapeOptions: {
        color: 'orange',
        fillOpacity: 0,
        dashArray: ('10, 10'),
        weight : 3,
      }
    }, false, false, true, {lat: this.mapCenter[0], lng: this.mapCenter[1]});
    this.buildForm();
    this.getAllItems();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filter) {
      this.loadMapData(this.filter);
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      number: [{value: '', disabled: true}, [Validators.required]],
      parking_code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      name_ar: ['', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      parking_angle: [0, [Validators.required]],
      parking_length: ['', [Validators.required]],
      parking_spaces: ['', [Validators.required, Validators.min(0)]],
      parking_dimension: ['', [Validators.required]],
      is_sensors: [false],
      parking_type: ['', [Validators.required]],
      managed_by: ['', [Validators.required]],
      zone_id: ['', [Validators.required]],
      spaces_nbr_from: ['', Validators.min(0)],
      spaces_nbr_to: ['', Validators.min(0)],
      info_notes: [''],
      functioning: [''],
      restriction: [''],
      payment_methods: ['', !Validators.required],
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
      const points = mapdataObj.features[0].geometry.coordinates[0];
      let center_point = points[0];
      let length = 0;
      this.coords = points;

      if (points.length > 3) {
        center_point[0] = points[0][0] + (points[1][0] - points[0][0]) / 2;
        center_point[1] = points[0][1] + (points[1][1] - points[0][1]) / 2;
        length = Math.round(this.distanceBetweenEarthCoordinates(points[1][1], points[1][0], points[0][1], points[0][0]));
      }

      // if (mapdataObj.features.length > 1) {
      //   mapdataObj.features.splice(1,1);
      // }
      if (this.currentParking && this.currentParking.id) {
        center_point = mapdataObj.features[0].geometry.coordinates;
      } else {
        if (
          mapdataObj.features.length === 1
          ) {
          const parkingMarker = {
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
          mapdataObj.features.push(parkingMarker);
        } else {
          center_point = mapdataObj.features[1].geometry.coordinates;
        }
      }

      this.form.controls['latitude'].setValue(center_point[0]);
      this.form.controls['longitude'].setValue(center_point[1]);
      this.form.controls['parking_length'].setValue(length);
      this.mapdrawdata = JSON.stringify(mapdataObj);
    } else {
      this.coords = [];
      this.form.controls['latitude'].setValue(0);
      this.form.controls['longitude'].setValue(0);
      this.form.controls['parking_length'].setValue(0);
    }
  }

  public onCancel() {
    this.resetForm();
  }

  public onSubmit() {
    const space_from = this.form.controls['spaces_nbr_from'].value;
    const space_to = this.form.controls['spaces_nbr_to'].value;
    let imagesToSave;
    if (space_from > space_to) {
      this.toastr.warning('"Space no to" should be equal or more than "spaces no from"!', 'Warning!');
    } else if (this.formValid(this.form, ['info_notes', 'is_sensors', 'payment_methods'])) {
      this.parking = this.form.value;
      this.parking.number = this.form.controls['number'].value;
      this.parking.parking_code = this.form.controls['parking_code'].value;
      this.parking.payment_methods = this.paymentMethodSelected
        .filter(p => p.checked === true)
        .map(p => p.id);


      if (this.imageUrls && this.imageUrls[0]) {
        this.pictures = [];
        this.imageUrls.forEach((v, i) => {
          if (this.imageUrls[i].startsWith('uploads/') === true) {
           this.pictures.push(this.imageUrls[i]);
          }
        });
      }
      if (this.pictures && this.pictures[0]) {
        imagesToSave = this.pictures.join(',');
      }
      this.parking.pictures_url = imagesToSave ? imagesToSave : '';

      if (this.currentParking && this.currentParking.id) {
        // update parking
        this.parking.project_id = this.currentParking.project_id;
        this.parking.id = this.currentParking.id;
        if (this.docFiles && this.docFiles.length) {
          this.uploadService.uploadManyByPurpose(this.docFiles, this.options).subscribe(res => {
            if (imagesToSave !== undefined) {
              this.parking.pictures_url += ',';
            }
            this.parking.pictures_url += res.join(',');
            this.parkingService.update(this.parking).subscribe(response => {
              this.toastr.success(' Parking is updated successfully!', 'Success!');
              this.resetForm();
            }, err => {
              this.notification.showNotification(err);
            });
          });
        } else {
          this.parkingService.update(this.parking).subscribe(res => {
            this.toastr.success(' Parking is updated successfully!', 'Success!');
            this.resetForm();
          }, err => {
            this.notification.showNotification(err);
          });
        }
      } else {
        // create parking
        this.parking.project_id = this.projectId;
        this.parking.connecting_points = JSON.stringify(this.coords);
        if (this.docFiles && this.docFiles.length) {
          this.uploadService.uploadManyByPurpose(this.docFiles, this.options).subscribe(res => {
            if (imagesToSave !== undefined) {
              this.parking.pictures_url += ',';
            }
            this.parking.pictures_url += res.join(',');
            this.parkingService.create(this.parking).subscribe(response => {
              this.toastr.success('Parking is created successfully!', 'Success!');
              this.resetForm();
            }, err => {
              this.notification.showNotification(err);
            });
          });
        } else {
          this.parkingService.create(this.parking).subscribe(res => {
            this.toastr.success('Parking is created successfully!', 'Success!');
            this.resetForm();
          }, err => {
            this.notification.showNotification(err);
          });
        }
      }
    } else {
      this.toastr.error('Please fill in the required fields.', 'Error!');
    }
  }

  public onDocumentAdded(event: any) {
    this.docFiles.push(event.file);
    if (this.docFiles.length) {
      this.createImageFromBlob(event.file);
    }
  }

  public onDocumentRemoved(event: any) {
    this.docFiles = event.currentFiles;
  }

  public onRemoveDoc(index: number) {
    this.docFiles.splice(index, 1);
  }

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
        docFiles: this.docFiles,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.imageUrls = [];
        this.docFiles = [];
        this.imageUrls = result.imageUrls;
        this.docFiles = result.localFiles;
      }
    });
  }

  private calculateEstSpaces() {
    const dim = this.form.controls['parking_dimension'].value;
    const find = this.dims.find(v => v.text === dim);
    const spaces_from = this.form.controls['spaces_nbr_from'].value;
    const spaces_to = this.form.controls['spaces_nbr_to'].value;
    let est_count = 0;

    if (spaces_from && spaces_to) {
      est_count = spaces_to - spaces_from + 1;
    } else {
      if (find) {
        const length = this.form.controls['parking_length'].value;
        const angle = this.form.controls['parking_angle'].value;

        if (length) {
          switch (angle) {
            case 0:
              est_count = Math.trunc(length / find.h);
              break;
            case 90:
              est_count = Math.trunc(length / find.w);
              break;
            default:
              const w1 = Math.cos(this.rad(angle)) * find.h;
              const w2 =  find.w / Math.sin(this.rad(angle));
              est_count = Math.trunc((length - w1) / w2);
              break;
          }
        }
      }
    }
    this.form.controls['parking_spaces'].setValue(est_count);
  }

  public onChangeDimension() {
    this.calculateEstSpaces();
  }

  private getAllItems() {
    forkJoin(
      this.parkingService.get({project_id: this.projectId}),
      this.parkingService.getPaymentMethod(),
      this.parkingService.getWithZones({project_id: this.projectId}),
      this.projectZoneService.get({project_id: this.projectId})
    ).subscribe(res => {
      const [parkings , paymentMethods, parkingWithZones, zones] = res;
      this.parkings = parkings;
      this.paymentMethods = paymentMethods;
      this.allZones = zones;
      this.zones = [...this.allZones];
      if (this.allZones.length === 0) {
        this.toastr.info('No zone avalable, please create a zone first', 'Alert');
      } else {
        this.form.controls['zone_id'].setValue(this.zones[0].id);
        this.onChangeZone({value: this.zones[0].id});
      }
      this.paymentMethodSelected = [];
      this.paymentMethods.forEach(p => {
        const method = {
          id: p.id,
          name: p.payment_name,
          checked: false
        };
        this.paymentMethodSelected.push(method);
      });
      this.parkingWithZones = parkingWithZones;
      this.loadMapData(this.filter);
    });
  }

  private getParkingCode(zone_id: string) {
    this.parkingService.getParkingCode({zone_id: zone_id}).subscribe(res => {
      this.form.controls['parking_code'].setValue(res);
    });
  }

  private getNumber(zone_id: string) {
    this.parkingService.getNumber({zone_id: zone_id, project_id: this.projectId}).subscribe(res => {
      this.form.controls['number'].setValue(res);
    });
  }

  public onChangeZone(event: any) {
    const zone_id = event.value;
    this.getNumber(zone_id);
    this.getParkingCode(zone_id);
    // this.getTariffSegment();
  }

  private loadMapData(filter: string = '') {
    filter = filter.trim().toLowerCase();
    const { mapdataObj } = this._loadMapData({
      parking: true
    }, (array: any[]) => {
        let [parkings, parkingMeters, signages, zones, openLands] = array;
        parkings = parkings.filter( v => {
          return v.name.toLocaleLowerCase().indexOf(filter) >= 0;
        });
        return [parkings, parkingMeters, signages, zones, openLands];
    });
    this.mapdata = mapdataObj;
  }

  public onAdd() {
    this.resetForm();
  }

  private resetForm() {
    this.currentParking = new Parking();
    this.form.reset({
      number: '',
      parking_code: '',
      name: '',
      name_ar: '',
      latitude: '',
      longitude: '',
      parking_angle: 0,
      parking_length: '',
      parking_spaces: '',
      parking_dimension: '',
      is_sensors: false,
      parking_type: '',
      managed_by: '',
      zone_id: '',
      spaces_nbr_from: '',
      spaces_nbr_to: '',
      info_notes: '',
    });

    this.docFiles = [];
    this.imageUrls = [];
    this.pictures = [];

    this.zones = this.allZones.filter( v => {
      return +v.project_id === +this.projectId;
    });

    this.form.controls['zone_id'].setValue(this.zones[0].id);

    this.removeErrorsFromForm(this.form);
    this.mapdrawdata = '';
    this.getAllItems();
  }

  public onMapParkingEditedEvent(event) {
    this.editFormById(event.id);
  }

  private editFormById(id: any) {
    this.docFiles = [];
    this.imageUrls = [];
    this.pictures = [];
    this.isImageZoomOn = false;
    this.selectedImg = null;

    this.currentParking = this.parkings.find(v => v.id === id);
    this.zones = this.allZones.filter( v => {
      return v.project_id === this.currentParking.project_id;
    });

    if (this.currentParking && this.currentParking.id) {
      this.mapPositionCenter = this.currentParking.connecting_points
        ? JSON.parse(this.currentParking.connecting_points).reduce((center, coords, i, allCoords) => {
          if (coords.length) {
            center[0] += +(coords[0] / allCoords.length).toFixed(6);
            center[1] += +(coords[1] / allCoords.length).toFixed(6);
          }
          return center;
        }, [0, 0])
        : [this.currentParking.latitude, this.currentParking.longitude];
      if (this.currentParking.pictures_url) {
        this.parkingImages = this.currentParking.pictures_url.split(',').map((url) => ((!!url) ? (url.startsWith('uploads') ?  this.apiEndpoint + '/' + url : url) : ''));
        this.selectedImg = {
          url: this.parkingImages[0],
          i: 0
        };
        this.isImageZoomOn = false;
      }
      this.paymentMethodSelected = [];
      this.paymentMethods.forEach(p => {
        const method = {
          id: p.id,
          name: p.payment_name,
          checked: false
        };

        if (this.currentParking.payment_methods && this.currentParking.payment_methods[0]) {
          if (this.currentParking.payment_methods.includes(p.id)) {
            method['checked'] = true;
          }
        }
        this.paymentMethodSelected.push(method);
      });

      this.form.reset({
        number: this.currentParking.number,
        parking_code: this.currentParking.parking_code,
        name: this.currentParking.name,
        name_ar: this.currentParking.name_ar,
        latitude: this.currentParking.latitude,
        longitude: this.currentParking.longitude,
        parking_angle: this.currentParking.parking_angle,
        parking_length: this.currentParking.parking_length,
        parking_spaces: this.currentParking.parking_spaces,
        parking_dimension: this.currentParking.parking_dimension,
        is_sensors: this.currentParking.is_sensors,
        parking_type: this.currentParking.parking_type,
        managed_by: this.currentParking.managed_by,
        zone_id: +this.currentParking.zone_id,
        spaces_nbr_from: this.currentParking.spaces_nbr_from,
        spaces_nbr_to: this.currentParking.spaces_nbr_to,
        info_notes: this.currentParking.info_notes,
        functioning:  this.currentParking.functioning,
        restriction:  this.currentParking.restriction,
      });

      if ( this.currentParking &&  this.currentParking.pictures_url) {
        this.imageUrls = this.currentParking.pictures_url.split(',');
      }

      const mapdataObj = {
        features: []
      };
      const parkingMarker = {
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
          coordinates: [this.currentParking.latitude, this.currentParking.longitude]
        }
      };
      mapdataObj.features.push(parkingMarker);
      this.mapdrawdata = JSON.stringify(mapdataObj);
    }
  }

  public onDelete(parking: Parking) {
    if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
      this.parkingService.delete(parking).subscribe(() => {
        this.toastr.success('The Parking is deleted successfully!', 'Success!');
        this.resetForm();
      }, err => {
        this.notification.showNotification(err);
      });
    }
  }

  /**
   * list view component event handler
   * @param filter
   */
  public onUpdateMapData(filter: string): void {
    this.loadParkingMapData(filter);
  }

  /**
   * load map with filter by id
   * @param filter
   */
  private loadParkingMapData(filter: string) {
    const { mapdataObj } = this._loadMapData({
      parking: true
    }, (array: any[]) => {
        let [parkings, parkingMeters, signages, zones, openLands] = array;
        parkings = parkings.filter( v => {
          return v.id === filter;
        });
        return [parkings, parkingMeters, signages, zones, openLands];
    });
    this.mapdata = mapdataObj;
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
}
