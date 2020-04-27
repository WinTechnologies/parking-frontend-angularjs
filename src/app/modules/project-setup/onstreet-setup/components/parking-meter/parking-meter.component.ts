import {Component, Input, OnChanges, OnInit, SimpleChanges, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import MapOptions from '../../../../../shared/classes/MapOptions';
import * as L from 'leaflet';
import {ToastrService} from 'ngx-toastr';
import {PgProjectZoneService} from '../../../common-setup/services/onstreet/project-zone.service';
import {forkJoin, Subject} from 'rxjs';
import {BaseOnStreetComponent} from '../../../common-setup/components/onstreet/base-onstreet/base-onstreet.component';
import {Asset, AssetModel} from '../../../../../components/assets/models/asset.model';
import {PgAssetModelsService} from '../../../../../components/assets/services/assets-models.service';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import {PgProjectsService} from '../../../../../components/projects/services/projects.service';
import {Project} from '../../../../../components/projects/models/project.model';
import {ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import {NotificationService} from '../../../common-setup/services/onstreet/notification.service';

const Icon = L.Icon.extend({
  options: {
    // shadowUrl: '/assets/marker-shadow.png',
    iconUrl: '/assets/project-setup/onstreet/parking_meter.svg',
    iconRetinaUrl: '/assets/project-setup/onstreet/parking_meter.svg',
    iconSize: [48, 48],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [48, 48]
  }
});

@Component({
  selector: 'app-parking-meter',
  templateUrl: './parking-meter.component.html',
  styleUrls: ['./parking-meter.component.scss']
})
export class ParkingMeterComponent extends BaseOnStreetComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectId: number;
  @Input() filter: string;
  @Input() mapCenter: any;
  @Input() isListViewOn: boolean;

  ngUnsubscribe: Subject<void> = new Subject<void>();

  form: FormGroup;

  mapOptions = new MapOptions(
    true,
    false,
    false,
    { icon: new Icon()},
    true, {lat: 48.864716, lng: 2.349014});

  mapdata = '';
  mapdrawdata = '';

  imageUrl: string;
  parcmeter_name: string;

  assetsModels: AssetModel[];
  assetsModelsFiltered: AssetModel[];

  assetsAvailable: Asset[];
  assetsAvailableFiltered: Asset[] = [];
  assetAvailableSelected: Asset;
  public allAssets: Asset[];
  public mapPositionCenter: any;
  public parkingImages: string[];
  public selectedImg: any;
  public isImageZoomOn = false;

  zones: ProjectZone[];
  zoneSelected: ProjectZone;
  parkingMeter: Asset = new Asset();

  project: Project;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly assetModelService: PgAssetModelsService,
    private readonly assetService: PgAssetService,
    private readonly projectService: PgProjectsService,
    private readonly projectZoneService: PgProjectZoneService,
    private readonly toastr: ToastrService,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filter) {
      this.loadMapData(this.filter);
    }
  }

  ngOnInit() {
    this.mapOptions.centerLocation = {lat: this.mapCenter[0], lng: this.mapCenter[1]};

    this.buildForm();
    this.assetModelService.get({type_asset: 'Parking Meter'}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.assetsModels = res;
      this.assetsModelsFiltered = this.assetsModels;
    });

    this.getAllItems();
  }

  /**
   * To initialize the form
   */
  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      codificationId: ['', [Validators.required]],
      zone: [''],
      // fullspecs_link: ['', Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{0,6})[/\\w .-]*/?')],
    });
  }

  /**
   * To retrieve all the item needed for this component
   */
  private getAllItems() {
    forkJoin(
      this.assetService.get({project_id: this.projectId, type_asset: 'Parking Meter', status: 'Installed'}),
      this.assetService.getAvailable({type_asset : 'Parking Meter'}),
      this.assetService.get({project_id: this.projectId, type_asset: 'Parking Meter'}),
      this.projectService.getProjectById(this.projectId),
      this.projectZoneService.get({project_id: this.projectId}),
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const [parking, assets, allParkingMeters, project, zone ] = res;
      this.parkingMeters = parking;
      this.assetsAvailable = assets.sort((a, b) => a.codification_id > b.codification_id ? 1 : -1);
      this.assetsAvailableFiltered = this.assetsAvailable;
      this.allAssets = allParkingMeters;
      this.project = project;
      if (zone) {
        this.form.controls['zone'].setValidators([Validators.required]);
        this.zones = zone;
        this.allZones = zone;
      }
      this.loadMapData(this.filter);
    });
  }

  /**
   * When the user change the position of the marker of the map
   * @param mapdata
   */
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
      const mapdataCreateObj = {
        features: []
      };
      const parkingMarker = {
        type: 'Feature',
        properties: {
          options: { icon: { options: {
                iconUrl: '/assets/project-setup/onstreet/parking_meter.svg',
                iconRetinaUrl: '/assets/project-setup/onstreet/parking_meter.svg',
                iconSize: [48, 48],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [48, 48]
              }} },
        },
        geometry: {
          type: 'Point',
          coordinates: [points[0], points[1]]
        }
      };
      mapdataCreateObj.features.push(parkingMarker);
      this.mapdrawdata = JSON.stringify(mapdataCreateObj);
    } else {
      this.form.controls['latitude'].setValue(0);
      this.form.controls['longitude'].setValue(0);
    }
  }

  /**
   * list view component event handler
   * @param filter
   */
  public onUpdateMapData(filter: string): void {
    this.loadParkingMeterMapData(filter);
  }

  /**
   * load map with filter by id
   * @param filter
   */
  private loadParkingMeterMapData(filter: string) {
    const { mapdataObj } = this._loadMapData({
      parking: true
    }, (array: any[]) => {
        let [parkings, parkingMeters, signages, zones, openLands] = array;
        parkingMeters = parkingMeters.filter( v => {
          return v.codification_id === filter;
        });
        return [parkings, parkingMeters, signages, zones, openLands];
    });
    const mapDataWithInfo = JSON.parse(mapdataObj);
    // add info to a point
    const v: Asset = this.allAssets.filter(s => s.codification_id === filter)[0];
    let needToAdd = true;
    mapDataWithInfo.features = mapDataWithInfo.features.map(feature => {
      if (feature.properties.info[Object.keys(feature.properties.info)[0]] === v.codification_id) {
        feature.properties.info['Configurations'] = v.configurations;
        feature.properties.info['Asset notes'] = v['asset_notes'];
        needToAdd = false;
      }
      return feature;
    });
    // add to map
    if (needToAdd) {
      const icon = v.img_url
        ? v.img_url.startsWith('uploads')
          ? this.apiEndpoint + '/' + v.img_url
          : v.img_url
        : v.model_img_url || 'No Icon';

      const marker = {
        type: 'Feature',
        properties: {
          options: { icon: { options: {
            iconUrl: icon,
            iconRetinaUrl: icon,
            iconSize: [48, 48],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [48, 48]
          }, _initHooksCalled: true } },
          info: { // info popup
            '<h5>Parking Meter</h5>Codification': v.codification_id, // title between the h5
            'Project': v.project_name,
            'Type': v.model_txt,
            'Zone': v['zone_name'],
            'Configurations': v.configurations,
            'Asset notes': v['asset_notes']
          }
        },
        geometry: {
          type: 'Point',
          coordinates: [v.latitude, v.longitude]
        }
      };
      mapDataWithInfo.features.push(marker);
    }
    this.mapdata = JSON.stringify(mapDataWithInfo);
  }

  /**
   * To retrieve all the data
   * @param filter
   */
  private loadMapData(filter: string = '') {
    filter = filter.trim().toLowerCase();
    const { mapdataObj } = this._loadMapData({
      parkingMeter: true
    }, (array: any[]) => {
      let [parkings, parkingMeters, signages, zones, openLands] = array;
      parkingMeters = parkingMeters.filter( v => {
        return v.model_txt.toLocaleLowerCase().indexOf(filter) >= 0;
      });
      return [parkings, parkingMeters, signages, zones, openLands];
    });
    this.mapdata = mapdataObj;
  }

  /**
   * When the user change of type of parking meter
   * @param value The name of the parking meter
   */
  public onChangeName(value: any) {
    if (!this.parkingMeter.codification_id) {
      this.parcmeter_name = value.name;
      this.assetsAvailableFiltered = this.assetsAvailable.filter(asset => asset.model_id === value.id);
      this.form.controls['codificationId'].reset();
    }
    this.imageUrl = value.img_url;
  }

  /**
   * When the user change of Codification Id
   * @param asset of the codificationId
   */
  public onChangeCodificationId(asset: Asset) {
    this.assetAvailableSelected = asset;
  }

  /**
   * When the user change of Zone
   * @param zone
   */
  public onChangeZone(zone: ProjectZone) {
    this.zoneSelected = zone;
  }

  /**
   * When the user click on the icon of parking Meter
   */
  public onAdd() {
    this.resetForm();
  }

  /**
   * To reset all the fields of the form
   */
  private resetForm() {
    this.parkingMeter = new Asset();
    this.form.reset({
      name: {value: '', disabled: false},
      latitude: '',
      longitude: '',
      codificationId: '',
      zone: '',
      // fullspecs_link: ''
    });
    this.assetsModelsFiltered = this.assetsModels;
    this.parcmeter_name = '';
    this.assetsAvailableFiltered = [];
    this.assetAvailableSelected = new Asset();
    this.imageUrl = '';
    this.removeErrorsFromForm(this.form);
    this.mapdrawdata = '';
    // this.mapdata = '';
    this.getAllItems();
  }

  public onMapEditedEvent(event: any) {
    this.editFormById(event.codification_id);
  }

  private editFormById(id: any) {
    this.isImageZoomOn = false;
    this.selectedImg = null;
    this.parkingMeter = this.parkingMeters.find(v => v.codification_id === id);
    if (this.parkingMeter && this.parkingMeter.codification_id) {
      this.mapPositionCenter = [this.parkingMeter.latitude, this.parkingMeter.longitude];
      if (this.parkingMeter.img_url) {
        this.parkingImages = this.parkingMeter.img_url.split(',').map((url) => ((!!url) ? (url.startsWith('uploads') ?  this.apiEndpoint + '/' + url : url) : ''));
        this.selectedImg = {
          url: this.parkingImages[0],
          i: 0
        };
        this.isImageZoomOn = false;
      }
      const assetModel = this.assetsModels.find( asstModel => asstModel.code === this.parkingMeter.model_code);
      if (assetModel) {
        this.onChangeName(assetModel);
        this.assetsModelsFiltered = [assetModel];
      }
      const asset = new Asset();
      asset.model_id = assetModel.id;
      asset.configurations = assetModel.configurations;
      asset.warranty_until = assetModel.product_warranty;
      asset.notes = assetModel.notes;
      asset.codification_id = this.parkingMeter.codification_id;
      this.assetsAvailableFiltered = [asset];
      this.form.reset({
        name: this.parkingMeter.model_txt,
        latitude: this.parkingMeter.latitude,
        longitude: this.parkingMeter.longitude,
        codificationId: this.parkingMeter.codification_id,
        zone: this.zones.filter(zone => zone.id).map(zone => zone.zone_name)[0],
        // fullspecs_link: assetModel.fullspecs_link
      });
      const mapdataObj = {
        features: []
      };

      const icon = this.parkingMeter.img_url
        ? this.parkingMeter.img_url.startsWith('uploads')
          ? this.apiEndpoint + '/' + this.parkingMeter.img_url
          : this.parkingMeter.img_url
        : this.parkingMeter.model_img_url || 'No Icon';

      const parkingMarker = {
        type: 'Feature',
        properties: {
          options: { icon: { options: {
            iconUrl: icon,
            iconRetinaUrl: icon,
            iconSize: [48, 48],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [48, 48]
          }, _initHooksCalled: true } },
        },
        geometry: {
          type: 'Point',
          coordinates: [this.parkingMeter.latitude, this.parkingMeter.longitude]
        }
      };
      mapdataObj.features.push(parkingMarker);
      this.mapdrawdata = JSON.stringify(mapdataObj);
    }
  }

  /**
   * On click on the button to confirm
   */
  public onSubmit() {
    if (this.formValid(this.form, [''])) {
      const form = this.form.value;
      const asset = new Asset();
      asset.status = 'Installed';
      asset.latitude = +form.latitude;
      asset.longitude = +form.longitude;
      if (this.parkingMeter && this.parkingMeter.codification_id) {
        asset.codification_id = this.parkingMeter.codification_id;
      } else if (this.assetAvailableSelected && this.assetAvailableSelected.codification_id) {
        asset.codification_id = this.assetAvailableSelected.codification_id;
      }
      asset.project_id = this.projectId;
      asset.deployed_at = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      if (this.zoneSelected) {
          asset.zone_id = this.zoneSelected.id;
      }
      // const modelChange = this.assetsModels.find(model => model.name === form.name);
      // modelChange.fullspecs_link = form.fullspecs_link;
      this.assetService.update(asset)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          if (this.parkingMeter.codification_id) {
            this.toastr.success('Parking Meter is updated successfully!', 'Success!');
          } else {
            this.toastr.success('Parking Meter is created successfully!', 'Success!');
          }
          this.resetForm();
        }, err => {
          this.notification.showNotification(err);
        });
    } else {
      this.toastr.error('Please fill in the required fields.', 'Error!');
    }
  }

  /**
   * Method executed on Click on cancel
   */
  public onCancel() {
    this.resetForm();
  }

  public onDelete(asset: Asset) {
    if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
      const newAsset: Asset = new Asset();
      newAsset.codification_id = asset.codification_id;
      newAsset.status = 'Available';
      newAsset.type_asset = asset.type_asset;
      newAsset.created_at = asset.created_at;
      newAsset.eol_at = asset.eol_at;
      newAsset.configurations = asset.configurations;
      newAsset.img_url = asset.img_url;
      newAsset.city_txt = asset.city_txt;
      newAsset.notes = asset.notes;
      newAsset.warranty_until = asset.warranty_until;
      newAsset.manufacturer = asset.manufacturer;
      newAsset.firmware_version = asset.firmware_version;
      this.assetService.update(newAsset).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.resetForm();
        this.toastr.success('The Asset is deleted successfully!', 'Success!');
      }, err => {
        this.notification.showNotification(err);
      });
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
}
