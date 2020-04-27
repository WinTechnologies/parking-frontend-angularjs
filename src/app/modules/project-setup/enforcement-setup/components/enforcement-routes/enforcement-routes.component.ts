import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProjectRoute} from '../../../../../components/enforcement/models/project-route.model';
import {PgProjectRouteService} from '../../../../../components/enforcement/services/project-route.service';
import {ToastrService} from 'ngx-toastr';
import {MatDialog, MatSidenav} from '@angular/material';
import {RouteStaffComponent} from './route-staff/route-staff.component';
import {Employee} from '../../../../../components/employees/models/employee.model';
import {forkJoin} from 'rxjs';
import {PgParkingsService} from '../../../common-setup/services/onstreet/parking.service';
import {PgProjectOpenLandService} from '../../../common-setup/services/onstreet/project-openland.service';
import {PgProjectZoneService} from '../../../common-setup/services/onstreet/project-zone.service';
import {ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import {Parking} from '../../../common-setup/models/onstreet/parking.model';
import {ProjectOpenLand} from '../../../common-setup/models/onstreet/project_openland.model';
import {Project} from '../../../../../components/projects/models/project.model';
import {PgProjectsService} from '../../../../../components/projects/services/projects.service';
import {Asset} from '../../../../../components/assets/models/asset.model';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import { LoaderService } from '../../../../../services/loader.service';

@Component({
  selector: 'app-enforcement-routes',
  templateUrl: './enforcement-routes.component.html',
  styleUrls: ['./enforcement-routes.component.scss']
})
export class EnforcementRoutesComponent implements OnInit {
  @Input() projectId: number;
  @ViewChild('drawer') drawer: MatSidenav;

  form: FormGroup;
  waypoints: any[] = [];
  coordinates: any[] = [];
  totalTime: any;
  totalDistance: any;
  employees: Employee[] = [];
  routeWayPoints: any[];
  isShowRouteList = false;

  mapCenter: any = {
    lat: 48.864716, lng: 2.349014
  };
  mapdata = '';
  zones: ProjectZone[];
  parkings: Parking[];
  openLands: ProjectOpenLand[];
  parkingMeters: Asset[];
  signages: Asset[];
  routes: ProjectRoute[];
  currentRoute: ProjectRoute;
  project: Project;
  selectedRoute: ProjectRoute;
  // filterLists: string[] = ['Parking', 'Signage', 'Parking Meter', 'Zone', 'Open land', 'Routes'];

  filterLists = [
    {
      id: 1,
      title: 'Parking',
      checked: 'false',
    },
    {
      id: 2,
      title: 'Signage',
      checked: 'false',
    },
    {
      id: 3,
      title: 'Parking Meter',
      checked: 'false',
    },
    {
      id: 4,
      title: 'Zone',
      checked: 'false',
    },
    {
      id: 5,
      title: 'Open land',
      checked: 'false',
    },
    {
      id: 6,
      title: 'Routes',
      checked: 'true',
    },

  ];

  selectedOptions: string[] = [];
  filter: string;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly projectRouteService: PgProjectRouteService,
    private readonly parkingService: PgParkingsService,
    private readonly projectOpenLandService: PgProjectOpenLandService,
    private readonly assetService: PgAssetService,
    private readonly projectZoneService: PgProjectZoneService,
    private readonly projectService: PgProjectsService,
    private readonly toastr: ToastrService,
    private readonly dialog: MatDialog,
    @Inject('API_ENDPOINT') private apiEndpoint,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.buildForm();
    this.getAllItems();
    this.projectService.getProjectById(this.projectId).subscribe(res => {
      if (res) {
        this.project = res;
        this.mapCenter = {
          lat: this.project.center_latitude,
          lng: this.project.center_longitude
        };
      }
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      route_code: [null, [Validators.required]],
      route_name: [null, [Validators.required]],
      distance_mins: [null, [Validators.required]],
      distance_meters: [null, [Validators.required]],
      nbr_staff: [null],
    });
  }

  public resetForm() {
    this.isShowRouteList = false;
    this.currentRoute = new ProjectRoute();
    this.form.reset();
    this.waypoints = [];
    this.routeWayPoints = [];
    this.employees = [];

    this.form.markAsUntouched();
    // this.form.controls['route_name'].setErrors(null);
    this.drawer.close();
    this.drawer.open();
  }

  public updateForm() {
    this.isShowRouteList = false;

    this.currentRoute = this.selectedRoute;
    this.waypoints = this.currentRoute.waypoints;
    this.routeWayPoints = this.currentRoute.waypoints;
    this.employees = this.currentRoute.staffs;

    this.form.patchValue({
      route_code: this.currentRoute.route_code,
      route_name: this.currentRoute.route_name,
      distance_mins: this.currentRoute.distance_mins,
      distance_meters: this.currentRoute.distance_meters,
      nbr_staff: this.currentRoute.staffs.length
    });

    this.form.markAsUntouched();

    this.routes = [this.currentRoute];
    this.loadMapData();

    this.drawer.close();
    this.drawer.open();
  }

  public onCancel() {
    this.drawer.close();
  }

  public onDelete(event) {
    event.stopPropagation();
    this.projectRouteService.delete(this.currentRoute.id).subscribe(res => {
      this.toastr.success('The route is deleted successfully!', 'Success!');
    });
    this.drawer.close();
  }

  public onSubmit() {
    if (this.form.valid) {
      const value = this.form.value;
      const route = new ProjectRoute();
      route.route_code = value.route_code;
      route.route_name = value.route_name;
      route.distance_mins = this.totalTime;
      route.distance_meters = this.totalDistance;
      route.project_id = this.projectId;
      route.connecting_points = JSON.stringify({
        coordinates: this.coordinates,
        waypoints: this.waypoints
      });
      route.staffs = this.employees.map(employee => employee.employee_id);
      if (this.currentRoute && this.currentRoute.id) {
        route.id = this.currentRoute.id;
        this.projectRouteService.update(route).subscribe(res => {
          this.toastr.success('The route is updated successfully!', 'Success!');
          this.getAllItems();
        });
      } else {
        this.projectRouteService.create(route).subscribe(res => {
          this.toastr.success('The route is created successfully!', 'Success!');
          this.resetForm();
          this.getAllItems();
        }, err => {
          if (err.error) {
            if (err.error.message.indexOf('duplicate key') >= 0) {
              this.toastr.error('Name is duplicated!', 'Error');
            }
          }
        });
      }
    }
  }

  public inputCheck(event: any) {
    const pattern = /[a-zA-Z0-9\/\ ]/;
    const inputChar = event.keyCode ? String.fromCharCode(event.keyCode) : (event.clipboardData).getData('text');
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public mapRoutesDataChanged(e: any) {
    this.waypoints = [];
    this.coordinates = [];

    if (e.routes.length) {
      this.waypoints = e.waypoints;
      const route = e.routes[0];
      this.totalTime = Math.round(route.summary.totalTime / 60);
      this.totalDistance = Math.round(route.summary.totalDistance);
      this.form.controls['distance_mins'].setValue( this.totalTime + ' mins');
      this.form.controls['distance_meters'].setValue( this.totalDistance  + ' meters');
      this.coordinates = route.coordinates;
    } else {
      this.form.controls['distance_mins'].setValue('');
      this.form.controls['distance_meters'].setValue('');
      this.totalTime = 0;
      this.totalDistance = 0;
    }
  }

  public onAddStaff() {
    const dialogRef = this.dialog.open(RouteStaffComponent, {
      width: '80%',
      data: {projectId: this.projectId, employees: this.employees}
    });

    console.log(this.employees);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employees = result;
        this.form.controls['nbr_staff'].setValue(this.employees.length);
      }
    });
  }

  private getAllItems() {
    forkJoin(
      this.parkingService.getWithDetails(),
      this.assetService.getByZones({type_asset: 'Parking Meter', status: 'Installed'}),
      this.assetService.getByZones({type_asset: 'Signage', status: 'Installed'}),
      this.projectRouteService.get(),
      this.projectZoneService.getWithProject({project_id: this.projectId}),
      this.projectOpenLandService.getWithDetails({project_id: this.projectId}),
    ).subscribe(res => {
      const [parkings, parkingMeters, signages, routes, zones, openland] = res;
      this.parkings = parkings;
      this.openLands = openland;
      this.parkingMeters = parkingMeters;
      this.signages = signages;
      this.zones = zones;
      this.routes = routes;
      this.loadMapData();
    });
  }

  private loadMapData(filter: string = '') {
    const mapdataObj = {
      features: []
    };
    filter = filter.trim().toLowerCase();
    let parkings = this.parkings || [];
    if (this.selectedOptions.includes('Parking')) {
      parkings = parkings.filter( v => {
        return v.name.toLocaleLowerCase().indexOf(filter) >= 0;
      });
    } else {
      parkings = [];
    }

    let parkingMeters = this.parkingMeters || [];
    if (this.selectedOptions.includes('Parking Meter')) {
      parkingMeters = parkingMeters.filter( v => {
        return v.model_txt.toLocaleLowerCase().indexOf(filter) >= 0;
      });
    } else {
      parkingMeters = [];
    }

    let signages = this.signages || [];
    if (this.selectedOptions.includes('Signage')) {
      signages = signages.filter( v => {
        return v.model_txt.toLocaleLowerCase().indexOf(filter) >= 0;
      });
    } else {
      signages = [];
    }

    let zones = this.zones || [];
    if (this.selectedOptions.includes('Zone')) {
      zones = zones.filter( v => {
        return v.zone_name.toLocaleLowerCase().indexOf(filter) >= 0;
      });
    } else {
      zones = [];
    }

    let openLands = this.openLands || [];
    if (this.selectedOptions.includes('Open land')) {
      openLands = openLands.filter( v => {
        return v.land_name.toLocaleLowerCase().indexOf(filter) >= 0;
      });
    } else {
      openLands = [];
    }
    let routes = this.routes || [];
    if (this.selectedOptions.includes('Routes')) {
      routes = routes.filter( v => {
        return v.route_name.toLocaleLowerCase().indexOf(filter) >= 0;
      });
    } else {
      routes = [];
    }

    // Display parking
    parkings.forEach(v => {
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
          }, _initHooksCalled: true }
        },
        info: { // info for popup of icon parking
          '<h5>Parking</h5>Type': v.parking_type, // title between the h5
          'Number': v.number.toLocaleString(['ban', 'id']),
          'Name ': v.name + v.name_ar,
          'Info ': v.info_notes,
          'Type ': v.parking_type,
          'Nbr. spaces': v.parking_spaces.toLocaleString(['ban', 'id']),
          'Manage by ': v.managed_by
        }
      },
      geometry: {
        type: 'Point',
        coordinates: [v.latitude, v.longitude]
      }
    };
    if (!!v['zone_name']) {
      parkingMarker.properties.info['Zone'] = v['zone_name'];
    }
    if (!!v['city_txt']) {
      parkingMarker.properties.info['City'] = v['city_txt'];
    }
    if (!!v['project_name']) {
      parkingMarker.properties.info['Project'] = v['project_name'];
    }
      mapdataObj.features.push(parkingMarker);
    });

    // Diplay parking Meter
    parkingMeters.forEach( v => {
      const icon = v.img_url
        ? v.img_url.startsWith('uploads')
          ? this.apiEndpoint + '/' + v.img_url
          : v.img_url
        : v.model_img_url || 'No Icon';

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
          info: { // the info for the popup signage
            '<h5>Parking Meter</h5>Codification': v.codification_id, // title between the h5
            'City': v.city_txt,
            'Project': v.project_name,
            'Type': v.model_txt,
          }
        },
        geometry: {
          type: 'Point',
          coordinates: [v.latitude, v.longitude]
        }
      };
      if (!!v['zone_name']) {
        parkingMarker.properties.info['Zone'] = v['zone_name'];
      }
      mapdataObj.features.push(parkingMarker);
    });

    // Display signages
    signages.forEach( v => {
      const icon = v.img_url
        ? v.img_url.startsWith('uploads')
          ? this.apiEndpoint + '/' + v.img_url
          : v.img_url
        : v.model_img_url || 'No Icon';

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
          info: { // the info for the popup signage
            '<h5>Signage</h5>Codification': v.codification_id, // title between the h5
            'Project': v.project_name,
            'Type': v.model_txt,
          }
        },
        geometry: {
          type: 'Point',
          coordinates: [v.latitude, v.longitude]
        }
      };
      if (!!v['zone_name']) {
        parkingMarker.properties.info['Zone'] = v['zone_name'];
      }
      if (!!v['city_txt']) {
        parkingMarker.properties.info['City'] = v['city_txt'];
      }
      mapdataObj.features.push(parkingMarker);
    });

    // Display OpenLands
    openLands.forEach( v => {
      const parkingMarker = {
        type: 'Feature',
        properties: {
          options: {
            color: 'red',
            weight : 3,
          },
          info: { // info for the popup OpenLands
            '<h5>Open Land</h5>Codification': v['zone_code'], // title between the h5
            'Perimeter': v.perimeter.toLocaleString(['ban', 'id']) + ' ( ' + v.measurement_unit + ' )',
            'Area': v.area.toLocaleString(['ban', 'id']) + ' ( Sq ' + v.measurement_unit + ' )',
          }
        },
        geometry: {
          type: 'Polygon',
          coordinates: [JSON.parse(v.connecting_points)]
        }
      };
      if (!!v['zone_name']) {
        parkingMarker.properties.info['Zone'] = v['zone_name'];
      }
      if (!!v['project_name']) {
        parkingMarker.properties.info['Project'] = v['project_name'];
      }
      mapdataObj.features.push(parkingMarker);
    });

    // Display zones
    zones.forEach( v => {
      const parkingMarker = {
        type: 'Feature',
        properties: {
          options: {
            color: 'orange',
            fillOpacity: 0,
            weight : 3,
          },
          info: { // the info for the popup zone
            '<h5>Zone</h5>Codification: ': v.zone_code, // title between the h5
            'Zone': v.zone_name + ' ' + v.zone_name_ar,
            'Perimeter': v.perimeter.toLocaleString(['ban', 'id']) + ' ( ' + v.measurement_unit + ' )',
            'Area': v.area.toLocaleString(['ban', 'id']) + ' ( Sq ' + v.measurement_unit + ' )',
          }
        },
        geometry: {
          type: 'Polygon',
          coordinates: [JSON.parse(v.connecting_points)]
        }
      };
      if (!!v['project_name']) {
        parkingMarker.properties.info['Project'] = v['project_name'];
      }
      mapdataObj.features.push(parkingMarker);
    });

    routes.forEach( route => {
      const ways = JSON.parse(route.connecting_points);
      ways.coordinates = ways.coordinates.map(v => {
        return [v.lat, v.lng];
      });
      // line
      const lines = {
        type: 'Feature',
        properties: {
          options: {
            color: '#ff7800',
            opacity: 0.5,
            stroke: true,
            weight: 4,
          },
          value: route,
          editable: true,
          info: { // the info for the popup route
            '<h5>Route</h5>Code': route.route_code, // title between the h5
            'Name': route.route_name,
            'Distance': route.distance_mins,
            'Length': route.distance_meters,
            'Nbr Staff': route.staffs.length,
            'Project': route.project_name
          }
        },
        geometry: {
          type: 'LineString',
          coordinates: ways.coordinates
        }
      };
      mapdataObj.features.push(lines);
      // marker
      ways.waypoints.forEach( (way: any, index: number) => {
        const marker = {
          type: 'Feature',
          properties: {
            options: { icon: { options: {
              iconUrl: index ? '/assets/route end_icon.svg' : '/assets/route start_icon.svg',
              iconRetinaUrl: index ? '/assets/route end_icon.svg' : '/assets/route start_icon.svg',
              iconSize: [25, 41],
              iconAnchor: [13, 22],
              popupAnchor: [1, -11],
              tooltipAnchor: [16, -28],
            }, _initHooksCalled: true } },
            value: route,
            editable: true,
            info: { // the info for the popup marker
              '<h5>Route</h5>Code': route.route_code, // title between the h5
              'Name': route.route_name,
              'Distance': route.distance_mins,
              'Length': route.distance_meters,
              'Nbr Staff': route.staffs.length,
              'Project': route.project_name
            }
          },
          geometry: {
            type: 'Point',
            coordinates: [way.latLng.lat, way.latLng.lng]
          }
        };
        mapdataObj.features.push(marker);

        // from marker to line
        let nearPoint = [1000, 1000];
        ways.coordinates.forEach(v => {
          if (((v[0] - way.latLng.lat) * (v[0] - way.latLng.lat) +
          (v[1] - way.latLng.lng) * (v[1] - way.latLng.lng)) <
          ((nearPoint[0] - way.latLng.lat) * (nearPoint[0] - way.latLng.lat) +
          (nearPoint[1] - way.latLng.lng) * (nearPoint[1] - way.latLng.lng))) {
            nearPoint = v;
          }
        });
        if (nearPoint[0] !== way.latLng.lat && nearPoint[1] !== way.latLng.lng) {
          const lines1 = {
            type: 'Feature',
            properties: {
              options: {
                color: '#ff7800',
                opacity: 0.5,
                dashArray: '10 10',
                stroke: true,
                weight: 4,
              },
              editable: true,
              info: route
            },
            geometry: {
              type: 'LineString',
              coordinates: [nearPoint, [way.latLng.lat, way.latLng.lng]]
            }
          };
          mapdataObj.features.push(lines1);
        }
      });

    });

    this.mapdata = JSON.stringify(mapdataObj);
  }

  public mapRouteEdited(event: any) {
    this.editFormByRouteId(event.id);
  }

  private async editFormByRouteId(id: any) {
    try {
      this.loaderService.enable();
      this.currentRoute = await this.projectRouteService.getOne(id).toPromise();
      if (this.currentRoute) {
        this.form.reset({
          route_code: this.currentRoute.route_code,
          route_name: this.currentRoute.route_name,
          distance_mins: this.currentRoute.distance_mins,
          distance_meters: this.currentRoute.distance_meters,
          nbr_staff: this.currentRoute.staffs.length || 0,
        });
        const ways = JSON.parse(this.currentRoute.connecting_points);
        this.waypoints = ways.waypoints;
        this.coordinates = ways.coordinates;
        this.routeWayPoints = ways.waypoints;
        this.employees = this.currentRoute.staffs;
        this.form.markAsUntouched();
        // this.form.controls['route_name'].setErrors(null);
        this.drawer.open();
      }
    } finally {
      this.loaderService.disable();
    }
  }

  onOpenRouteList() {
    if (!this.selectedRoute) {
      this.isShowRouteList = !this.isShowRouteList;
    } else {
      this.selectedRoute = null;
    }
  }

  applyChangedRoute(event: ProjectRoute) {
    this.selectedRoute = event;
  }

  public onSelection(e: any, v: any) {
    if (e.option.value === 'All') {
      if (e.option.selected) {
        v.selectAll();
      } else {
        v.deselectAll();
      }
    } else {
      if (!e.option.selected) {
        if (this.selectedOptions.length &&
            this.selectedOptions.includes('All')) {
          this.selectedOptions = this.selectedOptions.slice(1);
        }
      }
    }

    this.loadMapData(this.filter);
  }

}
