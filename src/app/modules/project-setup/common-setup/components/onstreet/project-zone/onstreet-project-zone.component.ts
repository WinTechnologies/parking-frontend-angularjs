import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BaseOnStreetComponent} from '../base-onstreet/base-onstreet.component';
import {ProjectZone} from '../../../models/onstreet/project_zone.model';
import MapOptions from '../../../../../../shared/classes/MapOptions';

import {ToastrService} from 'ngx-toastr';
import { forkJoin } from 'rxjs';

import {PgAssetService} from '../../../../../../components/assets/services/assets.service';
import {PgProjectZoneService} from '../../../services/onstreet/project-zone.service';
import {PgProjectOpenLandService} from '../../../services/onstreet/project-openland.service';
import {NotificationService} from '../../../services/onstreet/notification.service';
@Component({
  selector: 'app-onstreet-project-zone',
  templateUrl: './onstreet-project-zone.component.html',
  styleUrls: ['./onstreet-project-zone.component.scss']
})
export class OnstreetProjectZoneComponent extends BaseOnStreetComponent implements OnInit, OnChanges {
  @Input() projectId: number;
  @Input() filter: string;
  @Input() mapCenter: any;
  @Input() isListViewOn: boolean;

  form: FormGroup;
  projectZone: ProjectZone;
  perimeter_units: string[] = ['Meters', 'Kilometers'];
  area_units: string[] = ['Sq Meters', 'Sq Kilometers'];

  mapOptions = new MapOptions(
    true,
    {
      shapeOptions: {
        color: 'orange',
        fillOpacity: 0,
        weight : 3,
      }
    },
    false,
    false,
    true, {lat: 48.864716, lng: 2.349014});

  mapdata = '';
  mapdrawdata = '';
  coords: any[] = [];
  area: number;
  perimeter: number;
  valid_code = true;
  public mapPositionCenter: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly projectZoneService: PgProjectZoneService,
    private readonly projectOpenLandService: PgProjectOpenLandService,
    private readonly assetService: PgAssetService,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  ngOnInit() {
    this.mapOptions.centerLocation = {lat: this.mapCenter[0], lng: this.mapCenter[1]};
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
      zone_code: ['', [Validators.required]],
      zone_name: ['', [Validators.required]],
      zone_name_ar: ['', [Validators.required]],
      perimeter: [''],
      measurement_unit: ['Meters', [Validators.required]],
      area: [''],
      area_units: ['Sq Meters', [Validators.required]],
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
      this.area = Math.round(this.ringArea(points[0]));
      this.perimeter = Math.round(this.distanceInArea(points[0]));
      this.coords = points[0];

      const mapdataCreateObj = {
        features: []
      };
      const polygon = {
        type: 'Feature',
        properties: {
          options: {
            color: 'orange',
            fillOpacity: 0,
            weight : 3,
          }
        },
        geometry: {
          type: 'Polygon',
          coordinates: points
        }
      };
      mapdataCreateObj.features.push(polygon);
      this.mapdrawdata = JSON.stringify(mapdataCreateObj);
    } else {
      this.coords = [];
      this.area = 0;
      this.perimeter = 0;
    }

    this.updateAreaAndPerimeter();
  }

  private updateAreaAndPerimeter() {
    const unit = this.form.controls['measurement_unit'].value;
    if (unit === 'Meters') {
      this.form.controls['area'].setValue(this.area);
      this.form.controls['perimeter'].setValue(this.perimeter);
    } else {
      const area = Math.round(this.area / 1000 / 1000);
      const perimeter = Math.round(this.perimeter / 1000);
      this.form.controls['area'].setValue(area);
      this.form.controls['perimeter'].setValue(perimeter);
    }
  }

  public onSubmit() {
    if (this.formValid(this.form, ['perimeter', 'area'])) {
      const zone = this.form.value as ProjectZone;
      zone.connecting_points = JSON.stringify(this.coords);
      zone.zone_code = this.form.controls['zone_code'].value;

      delete zone['area_units'];
      if (this.projectZone && this.projectZone.id) {
        zone.project_id = this.projectZone.project_id;
        zone.id = this.projectZone.id;
        this.projectZoneService.update(zone).subscribe(res => {
          this.toastr.success('Zone is updated successfully!', 'Success!');
          this.resetForm();
        }, err => {
          this.notification.showNotification(err);
        });
      } else {
        zone.project_id = this.projectId;
        this.projectZoneService.create(zone).subscribe(res => {
          this.toastr.success('Zone is created successfully!', 'Success!');
          this.resetForm();
        }, err => {
          this.notification.showNotification(err);
        });
      }
    }
  }

  public onCancel() {
    this.resetForm();
  }

  public onChangeUnit(value: string) {
    if (value === 'Meters') {
      this.form.controls['area_units'].setValue('Sq Meters');
    } else if (value === 'Kilometers') {
      this.form.controls['area_units'].setValue('Sq Kilometers');
    }

    this.updateAreaAndPerimeter();
  }

  private getAllItems() {
    forkJoin(
      this.projectZoneService.get({project_id: this.projectId}),
      this.projectZoneService.getZoneCode({project_id: this.projectId})
    ).subscribe( res => {
      let zone_code;
      [this.allZones, zone_code] = res;
      this.loadMapData(this.filter);
      if (zone_code.startsWith('undefined')) {
        this.valid_code = false;
      }
      this.form.controls['zone_code'].setValue(zone_code);
    });
  }

  /**
   * list view component event handler
   * @param filter
   */
  public onUpdateMapData(filter: string): void {
    this.loadSignageMapData(filter);
  }

  /**
   * load map with filter by id
   * @param filter
   */
  private loadSignageMapData(filter: string) {
    const { mapdataObj } = this._loadMapData({
      parking: true
    }, (array: any[]) => {
      let [parkings, parkingMeters, signages, zones, openLands] = array;
      zones = zones.filter( v => {
        return v.id === filter;
      });
      return [parkings, parkingMeters, signages, zones, openLands];
    });
    const mapDataWithInfo = JSON.parse(mapdataObj);
    // leave only selected zone
    mapDataWithInfo.features = mapDataWithInfo.features.filter(feature => feature.properties.info[Object.keys(feature.properties.info)[0]] === +filter);
    this.mapdata = JSON.stringify(mapDataWithInfo);
  }

  private loadMapData(filter: string = '') {
    filter = filter.trim(); // Remove whitespace
    filter = filter.toLowerCase(); // lowercase matches
    const { mapdataObj } = this._loadMapData({
      zone: true
    }, (array: any[]) => {
      let [parkings, parkingMeters, signages, zones, openLands] = array;
      zones = zones.filter( v => {
        return v.zone_name.toLocaleLowerCase().indexOf(filter) >= 0;
      });
      return [parkings, parkingMeters, signages, zones, openLands];
    });
    this.mapdata = mapdataObj;
  }

  public onAdd() {
    this.resetForm();
  }

  private resetForm() {
    this.projectZone = new ProjectZone();
    this.form.reset({
      zone_code: '',
      zone_name: '',
      zone_name_ar: '',
      perimeter: '',
      measurement_unit: 'Meters',
      area: '',
      area_units: 'Sq Meters'
    });
    this.removeErrorsFromForm(this.form);
    this.mapdrawdata = '';
    this.getAllItems();
  }

  public onMapEditedEvent(event: any) {
    this.editFormById(event.id);
  }

  private editFormById(id: any) {
    this.projectZone = this.allZones.find(v => v.id === id);
    if (this.projectZone && this.projectZone.id) {
      this.mapPositionCenter = this.projectZone.connecting_points
        ? JSON.parse(this.projectZone.connecting_points).reduce((center, coords, i, allCoords) => {
          if (coords.length) {
            center[0] += +(coords[0] / allCoords.length).toFixed(6);
            center[1] += +(coords[1] / allCoords.length).toFixed(6);
          }
          return center;
        }, [0, 0])
        : this.mapCenter;

      this.form.reset({
        zone_code: this.projectZone.zone_code,
        zone_name: this.projectZone.zone_name,
        zone_name_ar: this.projectZone.zone_name_ar,
        perimeter: this.projectZone.perimeter,
        measurement_unit: this.projectZone.measurement_unit,
        area: this.projectZone.area,
        area_units: '',
      });
      this.coords = JSON.parse(this.projectZone.connecting_points);

      if (this.projectZone.measurement_unit === 'Meters') {
        this.area = this.projectZone.area;
        this.perimeter = this.projectZone.perimeter;
      } else {
        this.area = this.projectZone.area * 1000 * 1000;
        this.perimeter = this.projectZone.perimeter * 100;
      }

      this.onChangeUnit(this.projectZone.measurement_unit);

      const mapdataObj = {
        features: []
      };
      const polygon = {
        type: 'Feature',
        properties: {
          options: {
            color: 'orange',
            fillOpacity: 0,
            weight : 3,
          },
          info: this.projectZone,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [JSON.parse(this.projectZone.connecting_points)]
        }
      };
      mapdataObj.features.push(polygon);
      this.mapdrawdata = JSON.stringify(mapdataObj);
    }
  }

  onDelete(projectZone: ProjectZone ) {
    const zone_id = projectZone.id;
    forkJoin(
      this.assetService.get({zone_id: zone_id}),
      this.projectOpenLandService.getWithDetails({zone_id: zone_id})
    ).subscribe(res => {
      const [assets, openLands] = res;
      if (assets && assets[0]) {
        this.toastr.warning('This zone is linked to an Asset!', 'Warning!');
      } else if (openLands && openLands[0]) {
        this.toastr.warning('This zone is linked to an Open Land!', 'Warning!');
      } else {
        if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
          this.projectZoneService.delete(projectZone).subscribe(() => {
            this.resetForm();
            this.toastr.success('Zone is deleted successfully!', 'Success!');
          }, err => {
            this.notification.showNotification(err);
          });
        }
      }
    });
  }

  public projectRedirect() {
    this.router.navigate(['project/list'], { queryParams: { id: this.projectId } });
  }

}

