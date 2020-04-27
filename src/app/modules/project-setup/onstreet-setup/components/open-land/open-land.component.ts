import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import MapOptions from '../../../../../shared/classes/MapOptions';
import {ProjectOpenLand} from '../../../common-setup/models/onstreet/project_openland.model';
import {PgProjectOpenLandService} from '../../../common-setup/services/onstreet/project-openland.service';
import {ToastrService} from 'ngx-toastr';
import {BaseOnStreetComponent} from '../../../common-setup/components/onstreet/base-onstreet/base-onstreet.component';
import {ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import {forkJoin} from 'rxjs';
import {PgProjectZoneService} from '../../../common-setup/services/onstreet/project-zone.service';
import { CurrentUserService } from '../../../../../services/current-user.service';
import { Router } from '@angular/router';
import {NotificationService} from '../../../common-setup/services/onstreet/notification.service';

@Component({
  selector: 'app-open-land',
  templateUrl: './open-land.component.html',
  styleUrls: ['./open-land.component.scss']
})
export class OpenLandComponent extends BaseOnStreetComponent implements OnInit, OnChanges {
  @Input() projectId: number;
  @Input() filter: string;
  @Input() mapCenter: any;
  @Input() isListViewOn: boolean;

  form: FormGroup;
  perimeter_units: string[] = ['Meters', 'Kilometers'];
  area_units: string[] = ['Sq Meters', 'Sq Kilometers'];
  projectOpenLand: ProjectOpenLand;

  mapOptions = new MapOptions(
    true,
    {
      shapeOptions: {
        color: 'red',
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
  public zones: ProjectZone[];
  currentUser: any;
  valid_code = true;
  land_code = '';
  public mapPositionCenter: any;
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly projectOpenLandService: PgProjectOpenLandService,
    private readonly projectZoneService: PgProjectZoneService,
    private readonly currentUserService: CurrentUserService,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  ngOnInit() {
    this.currentUserService.get().then(user => {
      this.currentUser = user;
    });

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
      land_code: ['', [Validators.required]],
      land_name: ['', [Validators.required]],
      perimeter: [''],
      measurement_unit: ['Meters', [Validators.required]],
      area: [''],
      area_units: ['Sq Meters', [Validators.required]],
      zone_id: ['', [Validators.required]],
      estimated_spaces: ['', [Validators.required]],
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
            color: 'red',
            weight : 3,
          }
        },
        geometry: {
          type: 'Polygon',
          coordinates: points
        }
      };
      mapdataCreateObj.features.push(polygon);
      console.log(polygon);
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
    const slot_w = 3;
    const slot_h = 5;
    this.form.controls['estimated_spaces'].setValue(Math.trunc(this.area / (slot_w * slot_h)));

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
      const openLand = this.form.value as ProjectOpenLand;
      openLand.land_code = this.land_code ? this.land_code : '';
      openLand.connecting_points = JSON.stringify(this.coords);
      delete openLand['area_units'];
      if (this.projectOpenLand && this.projectOpenLand.id) {
        openLand.project_id = this.projectOpenLand.project_id;
        openLand.id = this.projectOpenLand.id;
        this.projectOpenLandService.update(openLand).subscribe(res => {
          this.toastr.success('Open Land is updated successfully!', 'Success!');
          this.resetForm();
        }, err => {
          this.notification.showNotification(err);
        });
      } else {
        openLand['created_by'] = this.currentUser.employee_id;
        openLand.project_id = this.projectId;
        this.projectOpenLandService.create(openLand).subscribe(res => {
          this.toastr.success('Open Land is created successfully!', 'Success!');
          this.resetForm();
        }, err=> {
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
      this.projectOpenLandService.get({project_id: this.projectId}),
      this.projectZoneService.get({project_id: this.projectId}),
      this.projectOpenLandService.getLandCode({project_id: this.projectId}),
    ).subscribe(res => {
      const [openlands, zones, land_code] = res;
      this.openLands = openlands;
      this.allZones = zones;
      this.zones = zones;
      this.land_code = land_code;
      this.loadMapData(this.filter);
      if (land_code.startsWith('undefined')) {
        this.valid_code = false;
      }
      this.form.controls['land_code'].setValue(this.land_code);
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
        openLands = openLands.filter( v => v.id === filter);
        return [parkings, parkingMeters, signages, zones, openLands];
    });
    const mapDataWithInfo = JSON.parse(mapdataObj);
    // leave only selected zone
    mapDataWithInfo.features = mapDataWithInfo.features.filter(feature => feature.properties.info[Object.keys(feature.properties.info)[0]] === +filter);
    this.mapdata = JSON.stringify(mapDataWithInfo);
  }

  private loadMapData(filter: string = '') {
    filter = filter.trim().toLowerCase();
    const { mapdataObj } = this._loadMapData({
      openLand: true
    }, (array: any[]) => {
        let [parkings, parkingMeters, signages, zones, openLands] = array;
        openLands = openLands.filter( v => v.land_name.toLocaleLowerCase().indexOf(filter) >= 0)
          .map(v => {
            v['zone_txt'] = zones.filter(z => z.id === v.zone_id)[0].zone_name;
            v['zone_name_ar'] = zones.filter(z => z.id === v.zone_id)[0].zone_name_ar;
            return v;
          });
        return [parkings, parkingMeters, signages, zones, openLands];
    });
    this.mapdata = mapdataObj;
  }

  public onAdd() {
    this.resetForm();
  }

  private resetForm() {
    this.projectOpenLand = new ProjectOpenLand();
    this.form.reset({
      land_code: '',
      land_name: '',
      perimeter: '',
      measurement_unit: 'Meters',
      area: '',
      area_units: 'Sq Meters',
      zone_id: '',
      estimated_spaces: ''
    });
    this.removeErrorsFromForm(this.form);
    this.mapdrawdata = '';
    this.getAllItems();
  }

  public onMapEditedEvent(event: any) {
    this.editFormById(event.id);
  }

  private editFormById(id: any) {
    this.projectOpenLand = this.openLands.find(v => v.id === id);
    this.zones = this.allZones.filter( v => {
      return v.project_id === this.projectOpenLand.project_id;
    });

    if (this.projectOpenLand && this.projectOpenLand.id) {
      this.mapPositionCenter = this.projectOpenLand.connecting_points
        ? JSON.parse(this.projectOpenLand.connecting_points).reduce((center, coords, i, allCoords) => {
          if (coords.length) {
            center[0] += +(coords[0] / allCoords.length).toFixed(6);
            center[1] += +(coords[1] / allCoords.length).toFixed(6);
          }
          return center;
        }, [0, 0])
        : this.mapCenter;
      this.form.reset({
        land_code: this.projectOpenLand.land_code || '',
        land_name: this.projectOpenLand.land_name,
        perimeter: this.projectOpenLand.perimeter,
        measurement_unit: this.projectOpenLand.measurement_unit,
        area: this.projectOpenLand.area,
        area_units: '',
        zone_id: +this.projectOpenLand.zone_id,
        estimated_spaces: this.projectOpenLand.estimated_spaces
      });
      this.coords = JSON.parse(this.projectOpenLand.connecting_points);

      if (this.projectOpenLand.measurement_unit === 'Meters') {
        this.area = this.projectOpenLand.area;
        this.perimeter = this.projectOpenLand.perimeter;
      } else {
        this.area = this.projectOpenLand.area * 1000 * 1000;
        this.perimeter = this.projectOpenLand.perimeter * 100;
      }

      this.onChangeUnit(this.projectOpenLand.measurement_unit);

      const mapdataObj = {
        features: []
      };
      const polygon = {
        type: 'Feature',
        properties: {
          options: {
            color: 'red',
            weight : 3,
          },
          info: this.projectOpenLand,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [JSON.parse(this.projectOpenLand.connecting_points)]
        }
      };
      mapdataObj.features.push(polygon);
      this.mapdrawdata = JSON.stringify(mapdataObj);
    }
  }

  onDelete(projectOpenLand: ProjectOpenLand) {
    if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
      this.projectOpenLandService.delete(projectOpenLand).subscribe(() => {
        this.resetForm();
        this.toastr.success('Open Land is deleted successfully!', 'Success!');
      }, err => {
        this.notification.showNotification(err);
      });
    }
  }

  public projectRedirect() {
    this.router.navigate(['project/list'], { queryParams: { id: this.projectId } });
  }
}
