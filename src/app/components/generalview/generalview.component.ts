import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import MapOptions from '../../shared/classes/MapOptions';
import { FilterdialogComponent } from './filterdialog/filterdialog.component';
import { PgParkingsService } from '../../modules/project-setup/common-setup/services/onstreet/parking.service';
import { PgProjectOpenLandService } from '../../modules/project-setup/common-setup/services/onstreet/project-openland.service';
import { PgProjectZoneService } from '../../modules/project-setup/common-setup/services/onstreet/project-zone.service';
import { forkJoin, Subject } from 'rxjs';
import { LengthUnit, ProjectZone } from '../../modules/project-setup/common-setup/models/onstreet/project_zone.model';
import { Parking } from '../../modules/project-setup/common-setup/models/onstreet/parking.model';
import { ProjectOpenLand } from '../../modules/project-setup/common-setup/models/onstreet/project_openland.model';
import { PgAssetService } from '../assets/services/assets.service';
import { Asset } from '../assets/models/asset.model';
import { ProjectRoute } from '../enforcement/models/project-route.model';
import { PgProjectRouteService } from '../enforcement/services/project-route.service';
import { FormControl } from '@angular/forms';
import { Project } from '../projects/models/project.model';
import { SocketService } from '../../services/socket.service';
import { Enforcer } from './model/enforcer';
import { ToastrService } from 'ngx-toastr';
import { ContraventionService } from '../../services/contravention.service';
import { JobService } from '../../services/job.service';
import { Contravention } from '../../shared/classes/contravention';
import { Job } from '../../shared/classes/job';
import { AuthService } from '../../core/services/auth.service';
import { CurrentUserService } from '../../services/current-user.service';
import { PgProjectsService } from '../projects/services/projects.service';
import { GeneralviewFilterService } from './generalview-filter.service';
import { ActivatedRoute } from '@angular/router';
import { MultipleSelectorComponent } from '../../shared/components/multiple-selector/multiple-selector.component';
import { Popover } from '../../shared/components/popover/popover.service';
import { CarparkService } from '../../modules/project-setup/carpark-setup/services/carpark.service';
import { TerminalService } from '../../modules/project-setup/carpark-setup/services/terminal.service';
import { HhdTrackingService } from '../../services/hhd-tracking.service';
import { HhdTracking } from '../../shared/classes/hhd-tracking';
import { ListEnforcerStatusService } from '../../services/list-enforcer-status.service';
import { ListEnforcerStatus } from '../../shared/classes/list-enforcer-status';
import { MapService } from '../../services/map.service';
import { CommonService } from '../../services/common.service';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-generalview',
    templateUrl: './generalview.component.html',
    styleUrls: ['./generalview.component.css']
})

export class GeneralviewComponent implements OnInit, OnChanges, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    @ViewChild('cityList') cityList;
    @ViewChild('citySelectList') citySelectList;

    mapOptions = new MapOptions(true, false, false, false, false, {
        // Jeddah Coordinate
        lat: 21.54238,
        lng: 39.19797
    });

    mapdata = '{"type": "FeatureCollection", "features": []}';
    mapdataOfHeatMap = '{"type": "FeatureCollection", "features": []}';
    features: any[] = [];
    mapCenter: any;

    zones: ProjectZone[];
    allZones: ProjectZone[];
    parkings: Parking[];
    openLands: ProjectOpenLand[];
    assets: Asset[];
    routes: ProjectRoute[];
    enforcers: Enforcer[] = [];
    eods: Enforcer[] = [];
    drivers: Enforcer[] = [];
    clampers: Enforcer[] = [];
    contraventions: Contravention[];
    jobs: Job[];
    hhdTracking: HhdTracking;
    parkingMeters: Asset[];
    signages: Asset[];

    carparkUnitsManaged: any[];
    carparkUnitsUnManaged: any[];

    onStreets: string[] = ['Zones']; // ['Parking_Meters', 'Signages', 'Sensors', 'Parking_Commercial', 'Parking_Mixed', 'Parking_Residential', 'Parking_Unmanaged', 'Vacant_Land', 'Zones']
    carParks: string[] = []; // ['Managed_MSCP', 'Managed_Surface', 'Managed_Basement', 'Managed_Automated', 'Unmanaged_MSCP', 'Unmanaged_Surface', 'Unmanaged_Basement', 'Unmanaged_Automated']
    enforcement: string[] = []; // ['Tow_Trucks', 'Clamp_Vans', 'Enforcers', 'Escalations_Captured', 'Escalations_Canceled', 'Pounds']
    enforcementCRM: string[] = [];

    isHeatMapView: boolean;

    // Field of the form and the input passed to the HeatMapviewComponent
    dateControl = new FormControl(new Date());
    date: Date = new Date();
    selectedCities = [];
    citySelectionDisabled = false;
    cities = [];
    // A counter to set the refresh of the heatmapview
    submit = 0;

    @Input() project: Project;

    allProjects: any[];
    allCarparkTypes: any[];
    allTerminals: any[] = [];

    // Permission Feature
    permissions = {
        filter: false,
        predictive: false
    };
    listEnforcerStatus: ListEnforcerStatus[];
    makerupSVG: any;
    tempColor;
    constructor(
      public dialog: MatDialog,
      private parkingService: PgParkingsService,
      private projectService: PgProjectsService,
      private projectOpenLandService: PgProjectOpenLandService,
      private projectZoneService: PgProjectZoneService,
      private projectRouteService: PgProjectRouteService,
      private assetService: PgAssetService,
      private socket: SocketService,
      private toastrService: ToastrService,
      private jobService: JobService,
      private contraventionService: ContraventionService,
      private authService: AuthService,
      private currentUserService: CurrentUserService,
      @Inject('API_ENDPOINT') private apiEndpoint: string,
      private filterService: GeneralviewFilterService,
      private route: ActivatedRoute,
      private popper: Popover,
      private carparkService: CarparkService,
      private terminalService: TerminalService,
      private hhdTrackingService: HhdTrackingService,
      private listEnforcerStatusService: ListEnforcerStatusService,
      private mapService: MapService,
      private commonService: CommonService

    ) {
        this.route.data
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(({ listCity }) => {

                this.cities = listCity
                    .filter(({ city_name }) => city_name !== null)
                    .map(({ city_code, city_code_pin, city_name, project_number, projects }) => {
                        return {
                            value: projects[0].id,
                            code: city_code,
                            code_pin: city_code_pin,
                            label: city_name,
                            project_ids: projects.map(project => project.id),
                            lat: projects[0].center_latitude,
                            lng: projects[0].center_longitude
                        };
                    });

                this.selectedCities.push(this.cities[0]);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.project && !changes.project.firstChange) {
            this.init();
        }
        if (changes.indexListProjects && !changes.indexListProjects.firstChange) {
            this.init();
        }
        if (changes.indexOnProjects && !changes.indexOnProjects.firstChange) {
            this.init();
        }

        if (changes.project && changes.project.currentValue) {
            this.cities.forEach((city) => {
                if (city.project_ids.indexOf(this.project.id) >= 0) {
                    this.selectedCities = [city];
                }
            });
            this.citySelectionDisabled = true;
        }
    }

    async ngOnInit() {
        const currentUser = await this.currentUserService.get();
        const filterFeature = this.project ? 'project_maps_filter' : 'global_maps_filter';
        const predictiveFeature = this.project ? 'project_maps_predictive' : 'global_maps_predictive';
        this.permissions.filter = CurrentUserService.canView(currentUser, filterFeature);
        this.permissions.predictive = CurrentUserService.canView(currentUser, predictiveFeature);

        if (this.project) {
            this.project = await this.projectService
              .getProjectById(this.project.id)
              .toPromise();
            this.mapCenter = [
                this.project.center_latitude,
                this.project.center_longitude
            ];
        }

        this.allProjects = await this.projectService.getAllUserProjects().toPromise();
        this.allCarparkTypes = await this.carparkService.getAllCarparkTypes().toPromise();
        this.allTerminals = await this.terminalService.get();

        // To retrieve the location of the user
        if (!this.project && window.navigator && window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(
                position => {
                    this.mapCenter = [
                        position.coords.latitude,
                        position.coords.longitude
                    ];
                }
            );
        }

        // Get the list of enforcer status via service.
        this.listEnforcerStatusService.getListEnforcerStatus()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe( list => {
                this.listEnforcerStatus = list;

                // get SVG as text
                this.mapService.getReadMarkerUps()
                .then(res => {
                    this.makerupSVG = res;
                    this.updateFiltersByStorage();
                    this.getAllItems();
                    this.getEnforcerPosition();
                });
            });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private init() {
        this.loadMapData();
    }

    showCityList(event) {
        if (!this.citySelectionDisabled) {
            const enabledCities = {};

            this.selectedCities.forEach((city) => {
                enabledCities[city.value] = true;
            });

            const ref = this.popper.open({
                content: MultipleSelectorComponent,
                origin: this.cityList,
                width: '250px',
                data: {
                    label: 'Cities',
                    searchPlaceholder: 'Search City',
                    enabled: enabledCities,
                    available: this.cities
                }
            });

            ref.afterSelected$
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(res => {
                    const projectIds = res.data;
                    this.selectedCities = [];
                    this.cities.forEach((city) => {
                        if (projectIds[city.value]) {
                            this.selectedCities.push(city);
                        }
                    });
                });
        }
    }

    private getAllItems() {
        const from = this.convertToISOString(false);
        const to = this.convertToISOString(true);
        const params = { from, to };

        forkJoin(
            this.parkingService.getWithDetails(),
            this.assetService.getByZones(),
            this.projectOpenLandService.getWithDetails(),
            this.projectZoneService.getWithProject(),
            this.projectRouteService.get(),
            this.contraventionService.getByFields(params),
            this.jobService.getJobsByFields(params),
            this.carparkService.getAll('map', { 'managed_by': 'Unmanaged' }),
            this.carparkService.getAll('map', { 'not_managed_by': 'Unmanaged' }),
        )
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => {
                this.parkings = res[0];
                this.parkingMeters = (res[1] as Asset[]).filter(asset => asset.type_asset === 'Parking Meter' && asset.status === 'Installed');
                this.signages = (res[1] as Asset[]).filter(asset => asset.type_asset === 'Signage' && asset.status === 'Installed');
                this.assets = res[1];
                this.openLands = res[2];
                this.allZones = res[3];
                this.routes = res[4];
                this.contraventions = res[5];
                this.jobs = res[6];
                this.carparkUnitsUnManaged = res[7];
                this.carparkUnitsManaged = res[8];
                this.loadMapData();
            }, error => {
                this.toastrService.error(error.error.message, 'Error !');
            });
    }

    private getEnforcerPosition() {
        this.socket.getMobileActiveUsers()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => {
                const indexEnforcer = this.enforcers.findIndex(enforcer => {
                    // return enforcer.username === res.username ;
                    return enforcer.employee_id === res.employee_id;
                });
                if (indexEnforcer !== -1) {
                    this.enforcers[indexEnforcer].latitude = res.latitude;
                    this.enforcers[indexEnforcer].longitude = res.longitude;
                    if (res.status_name) {
                        this.enforcers[indexEnforcer].status_name = res.status_name;
                    }
                } else if (res.usertype === 'Enforcer') {
                    this.enforcers.push(res);
                }

                const indexEOD = this.eods.findIndex(eod => {
                    // return eod.username === res.username ;
                    return eod.employee_id === res.employee_id;
                });
                if (indexEOD !== -1) {
                    this.eods[indexEOD].latitude = res.latitude;
                    this.eods[indexEOD].longitude = res.longitude;
                    if (res.status_name) {
                        this.eods[indexEOD].status_name = res.status_name;
                    }
                } else if (res.usertype === 'EOD') {
                    this.eods.push(res);
                }

                const indexDriver = this.drivers.findIndex(driver => {
                    // return driver.username === res.username;
                    return driver.employee_id === res.employee_id;
                });

                if (indexDriver !== -1) {
                    this.drivers[indexDriver].latitude = res.latitude;
                    this.drivers[indexDriver].longitude = res.longitude;
                    if (res.status_name) {
                        this.drivers[indexDriver].status_name = res.status_name;
                    }
                } else if (res.usertype === 'Driver') {
                    this.drivers.push(res);
                }

                const indexClamper = this.clampers.findIndex(clamper => {
                    return clamper.username === res.username;
                });

                if (indexClamper !== -1) {
                    this.clampers[indexClamper].latitude = res.latitude;
                    this.clampers[indexClamper].longitude = res.longitude;
                } else if (res.usertype === 'Clamper') {
                    this.clampers.push(res);
                }

                this.loadMapData(true);
            });

        this.socket.getLogout()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(result => {
                this.deleteEnforcement(result);
            });
    }

    /**
     * To Add the markers and zones selected on the filter dialog on the mapdata object
     */

    private loadMapData(enforcer: boolean = false) {
        const mapdataObj = {
            features: []
        };

        if (enforcer) {
            if (this.enforcement.includes('Enforcers')) {
                this.addEnforcer();
            }
            if (this.enforcement.includes('EOD')) {
                this.addEod();
            }
            if (this.enforcement.includes('Driver')) {
                this.addDriver();
            }
            if (this.enforcement.includes('Clamper')) {
                this.addClamper();
            }
        } else {
            const parkings = this.parkings || [];
            const parkingMeters = this.parkingMeters || [];
            const signages = this.signages || [];
            const zones = this.allZones || [];
            const openLands = this.openLands || [];
            const assets = this.assets || [];
            const routes = this.routes || [];
            const contraventions = this.contraventions || [];
            const jobs = this.jobs || [];
            // We have some data which use the same services so we filter the data first to avoid duplicate marker
            const parkings_filtered: Parking[] = [];
            const assets_filtered: Asset[] = [];
            const jobs_filtered: Job[] = [];
            const contravention_filtered: Contravention[] = [];

            // To filter the parking with Sensors, Parking_Commercial, ...
            parkings.forEach(v => {
                // If the generalview displayed on project we filtered the result with the project id (it's for all 'foreach')
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }
                if (this.onStreets.includes('Sensors') && v.is_sensors) {
                    parkings_filtered.push(v);
                }
                if (this.onStreets.includes('Parking_Commercial') && v.parking_type === 'Commercial' && !parkings_filtered.includes(v)) {
                    parkings_filtered.push(v);
                } else if (this.onStreets.includes('Parking_Mixed') && v.parking_type === 'Residential' && !parkings_filtered.includes(v)) {
                    parkings_filtered.push(v);
                } else if (this.onStreets.includes('Parking_Residential') && v.parking_type === 'Residential' && !parkings_filtered.includes(v)) {
                    parkings_filtered.push(v);
                } else if (this.onStreets.includes('Parking_Unmanaged') && v.parking_type === 'Unmanaged' && !parkings_filtered.includes(v)) {
                    parkings_filtered.push(v);
                }
            });

            // To display the icon parking
            parkings_filtered.forEach(v => {
                const parkingMarker = {
                    type: 'Feature',
                    properties: {
                        options: {
                            icon: {
                                options: {
                                    iconUrl: '/assets/project-setup/onstreet/parking.svg',
                                    iconRetinaUrl: '/assets/project-setup/onstreet/parking.svg',
                                    iconSize: [48, 48],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    tooltipAnchor: [16, -28],
                                    shadowSize: [48, 48]
                                },
                                _initHooksCalled: true
                            }
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

            // To display the area of parking
            parkings_filtered.forEach(v => {
                if (v.connecting_points) {
                    const parkingMarker = {
                        type: 'Feature',
                        properties: {
                            options: {
                                color: 'blue',
                                weight: 3,
                            },
                            info: { // info for popup area of parking
                                '<h5>Area of Parking</h5>ID': v.zone_id, // title between the h5
                                'Number': v.number.toLocaleString(['ban', 'id']),
                                'City': v['city_txt'],
                                'Project ': v['project_name'],
                                'Name ': v.name + v.name_ar,
                                'Info ': v.info_notes,
                                'Type ': v.parking_type,
                                'Nbr. spaces': v.parking_spaces.toLocaleString(['ban', 'id']),
                                'Manage by ': v.managed_by
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
                    mapdataObj.features.push(parkingMarker);
                }
            });

            // To display the parcmeter
            if (this.onStreets.includes('Parking_Meters')) {
                parkingMeters.forEach(v => {
                    if (this.project && this.project.id !== v.project_id) {
                        return;
                    }
                    const icon = v.img_url
                      ? v.img_url.startsWith('uploads')
                        ? this.apiEndpoint + '/' + v.img_url
                        : v.img_url
                      : v.model_img_url || 'No Icon';

                    const parkingMarker = {
                        type: 'Feature',
                        properties: {
                            options: {
                                icon: {
                                    options: {
                                        iconUrl: icon,
                                        iconRetinaUrl: icon,
                                        iconSize: [48, 48],
                                        iconAnchor: [12, 41],
                                        popupAnchor: [1, -34],
                                        tooltipAnchor: [16, -28],
                                        shadowSize: [48, 48]
                                    }, _initHooksCalled: true
                                }
                            },
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
            }

            // To display the signages
            if (this.onStreets.includes('Signages')) {
                signages.forEach(v => {
                    if (this.project && this.project.id !== v.project_id) {
                        return;
                    }
                    const icon = v.img_url
                      ? v.img_url.startsWith('uploads')
                        ? this.apiEndpoint + '/' + v.img_url
                        : v.img_url
                      : v.model_img_url || 'No Icon';
                    const signage = {
                        type: 'Feature',
                        properties: {
                            options: {
                                icon: {
                                    options: {
                                        iconUrl: icon,
                                        iconRetinaUrl: icon,
                                        iconSize: [48, 48],
                                        iconAnchor: [12, 41],
                                        popupAnchor: [1, -34],
                                        tooltipAnchor: [16, -28],
                                        shadowSize: [48, 48]
                                    }, _initHooksCalled: true
                                }
                            },
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
                        signage.properties.info['Zone'] = v['zone_name'];
                    }
                    if (!!v['city_txt']) {
                        signage.properties.info['City'] = v['city_txt'];
                    }
                    mapdataObj.features.push(signage);
                });
            }

            // To display the area of the openLands
            if (this.onStreets.includes('Open_Land')) {
                openLands.forEach(v => {
                    if (this.project && this.project.id !== v.project_id) {
                        return;
                    }

                    if (!v.connecting_points) {
                        return;
                    }

                    const parkingMarker = {
                        type: 'Feature',
                        properties: {
                            options: {
                                color: 'red',
                                weight: 3,
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
            }

            // To display the area of the zone
            if (this.onStreets.includes('Zones')) {
                zones.forEach(v => {

                    if (this.project && this.project.id !== v.project_id) {
                        return;
                    }

                    if (!v.connecting_points) {
                        return;
                    }

                    if (!v.perimeter) {
                        v.perimeter = 0;
                    }
                    if (!v.area) {
                        v.area = 0;
                    }

                    if (!v.measurement_unit) {
                        v.measurement_unit = LengthUnit.Meters;
                    }
                    const parkingMarker = {
                        type: 'Feature',
                        properties: {
                            options: {
                                color: 'orange',
                                fillOpacity: 0,
                                weight: 3,
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
            }

            // To filter the assets with Tow_Trucks and Clamps_Van
            assets.forEach(v => {
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }
                if (this.enforcement.includes('Tow_Trucks') && v.type_asset === 'Truck') {
                    assets_filtered.push(v);
                }
                if (this.enforcement.includes('Clamp_Vans') && v.type_asset === 'Van') {
                    assets_filtered.push(v);
                }
            });

            // To display the assets
            assets_filtered.forEach(v => {
                let iconAsset;
                if (v.type_asset === 'Truck') {
                    iconAsset = '/assets/Icons/Projects_section/Project list/tow truck.svg';
                } else if (v.type_asset === 'Van') {
                    iconAsset = '/assets/Icons/Projects_section/Project list/clamp van.svg';
                }
                if (iconAsset) {
                    const parkingMarker = {
                        type: 'Feature',
                        properties: {
                            options: {
                                icon: {
                                    options: {
                                        iconUrl: iconAsset,
                                        iconRetinaUrl: iconAsset,
                                        iconSize: [48, 48],
                                        iconAnchor: [12, 41],
                                        popupAnchor: [1, -34],
                                        tooltipAnchor: [16, -28],
                                        shadowSize: [48, 48]
                                    }, _initHooksCalled: true
                                }
                            },
                            info: { // info for popup of the Tow Trucks
                                // '<h5>Tow Trucks</h5>ID': v.id, // title between the h5
                                '<h5>Tow Trucks</h5>Codification ID': v.codification_id,
                                'Model ': v.model_txt,
                                'Model Code': v.model_code,
                                'Status': v.status,
                                'Zone code': v.zone_code,
                                'Zone txt': v.zone_txt,
                                'Date created': v.created_at,
                                'Date deployed': v.deployed_at,
                                'Type asset': v.type_asset,
                                'Manufacturer': v.manufacturer,
                                'Firmware version': v.firmware_version,
                                'Date end of life': v.eol_at,
                                'Product warranty': v.warranty_until,
                                'Configurations': v.configurations,
                                'Project ID': v.project_id,
                                'Project name': v.project_name,
                                'Asset notes': v.notes,
                                'IP address': v.ip_address
                            }
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [v.latitude, v.longitude]
                        }
                    };
                    mapdataObj.features.push(parkingMarker);
                }
            });

            // To display the routes
            if (this.enforcement.includes('Routes')) {
                routes.forEach(route => {
                    if (this.project && this.project.id !== route.project_id) {
                        return;
                    }
                    const ways = JSON.parse(route.connecting_points);
                    ways.coordinates = ways.coordinates.map(v => {
                        return [v.lat, v.lng];
                    });
                    // line
                    const lines = {
                        type: 'Feature',
                        properties: {
                            options: {
                                color: '#09ad2a',
                                opacity: 0.5,
                                stroke: true,
                                weight: 4,
                            },
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
                    ways.waypoints.forEach((way: any, index: number) => {
                        const marker = {
                            type: 'Feature',
                            properties: {
                                options: {
                                    icon: {
                                        options: {
                                            iconUrl: index ? '/assets/route end_icon.svg' : '/assets/route start_icon.svg',
                                            iconRetinaUrl: index ? '/assets/route end_icon.svg' : '/assets/route start_icon.svg',
                                            iconSize: [25, 41],
                                            iconAnchor: [13, 22],
                                            popupAnchor: [1, -11],
                                            tooltipAnchor: [16, -28],
                                        }, _initHooksCalled: true
                                    }
                                },
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
                                        color: '#09ad2a',
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
            }

            // To filter jobs with types (open, paid .....)
            jobs.forEach(j => {
                if (this.enforcementCRM.includes('TOW REQUESTED ' + j.job_type) && j.status === 'TOW REQUESTED' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('CLAMP REQUESTED ' + j.job_type) && j.status === 'CLAMP REQUESTED' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('DECLAMP REQUESTED ' + j.job_type) && j.status === 'DECLAMP REQUESTED' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('TOWED ' + j.job_type) && j.status === 'TOWED' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('CLAMPED ' + j.job_type) && j.status === 'CLAMPED' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('TOW IN ROUTE ' + j.job_type) && j.status === 'TOW IN ROUTE' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('CLAMP IN ROUTE ' + j.job_type) && j.status === 'CLAMP IN ROUTE' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('DECLAMP IN ROUTE ' + j.job_type) && j.status === 'DECLAMP IN ROUTE' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('COMPLETE ' + j.job_type) && j.status === 'COMPLETE' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('PAID ' + j.job_type) && j.status === 'PAID' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('RELEASED ' + j.job_type) && j.status === 'RELEASED' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('CLOSED ' + j.job_type) && j.status === 'CLOSED' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('CANCELED ' + j.job_type) && j.status === 'CANCELED' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
                if (this.enforcementCRM.includes('MISSED ' + j.job_type) && j.status === 'MISSED' && !jobs_filtered.includes(j)) {
                    jobs_filtered.push(j);
                }
            });

            // To display the jobs
            jobs_filtered.forEach(v => {
                let iconJob = Job.getJobIcon(v.job_type, v.status);
                iconJob = iconJob ? iconJob : 'default_icon';
                const iconJobPath = '/assets/job-icons/' + iconJob + '.svg';

                if (iconJobPath) {
                    const jobMarker = {
                        type: 'Feature',
                        properties: {
                            options: {
                                icon: {
                                    options: {
                                        iconUrl: iconJobPath,
                                        iconRetinaUrl: iconJobPath,
                                        iconSize: [48, 48],
                                        iconAnchor: [12, 41],
                                        popupAnchor: [1, -34],
                                        tooltipAnchor: [16, -28],
                                        shadowSize: [48, 48]
                                    }, _initHooksCalled: true
                                }
                            },
                            info: {
                                '<h5>Job</h5> Type ': v.job_type,
                                'Car brand': v.car_brand,
                                'Car model': v.car_model,
                                'Car licence plate': v.car_plate,
                                'Project ID': v.project_id,
                                'Project name': v.project_name,
                                'Zone name': v.zone_name,
                                'Created at': v.creation_gmt
                            }
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [v.latitude, v.longitude]
                        }
                    };
                    mapdataObj.features.push(jobMarker);
                }
            });

            // To filter Contraventons with types (contravention, observation ...)
            contraventions.forEach(c => {
                if (this.enforcementCRM.includes('Observation') && c.status === '0' && !contravention_filtered.includes(c)) {
                    contravention_filtered.push(c);
                }
                if (this.enforcementCRM.includes('Contravention') && c.status === '1' && !contravention_filtered.includes(c)) {
                    contravention_filtered.push(c);
                }
                if (this.enforcementCRM.includes('Canceled Observation') && c.status === '2' && !contravention_filtered.includes(c)) {
                    contravention_filtered.push(c);
                }
            });

            // To dislplay the contraventions
            contravention_filtered.forEach(v => {
                let iconPath;
                let type;
                switch (v.status) {
                    case '0':
                        iconPath = '/assets/contravention-icons/observation.svg';
                        type = 'Observation';
                        break;
                    case '1':
                        iconPath = '/assets/contravention-icons/contravention.svg';
                        type = 'Contravention';
                        break;
                    case '2':
                        iconPath = '/assets/contravention-icons/canceled_contravention.svg';
                        type = 'Canceled Contravention';
                        break;
                }

                const contraventionMarker = {
                    type: 'Feature',
                    properties: {
                        options: {
                            icon: {
                                options: {
                                    iconUrl: iconPath,
                                    iconRetinaUrl: iconPath,
                                    iconSize: [48, 48],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    tooltipAnchor: [16, -28],
                                    shadowSize: [48, 48]
                                },
                                _initHooksCalled: true
                            }
                        },
                        info: {
                            '<h5>Contravention</h5> Type ': type,
                            // 'Picture: <img src=[v.violation_picture] width =\'50px\' height =\'50px\'> </br>
                            'Car brand': v.car_brand,
                            'Car type': v.car_type,
                            'Plate country': v.plate_country,
                            'Project ID': v.project_id,
                            'Project name': v.project_name,
                            'Zone name': v.zone_name,
                            'Created at': v.creation_gmt
                        }
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [v.latitude, v.longitude]
                    }
                };
                mapdataObj.features.push(contraventionMarker);
            });

            // To display the enforcements
            if (this.enforcement.includes('Enforcers') && !this.project) {
                this.addEnforcer();
            }
            if (this.enforcement.includes('EOD') && !this.project) {
                this.addEod();
            }
            if (this.enforcement.includes('Driver') && !this.project) {
                this.addDriver();
            }
            if (this.enforcement.includes('Clamper') && !this.project) {
                this.addClamper();
            }

            // To display the CARPARK
            if (!mapdataObj.features.length) {
                mapdataObj.features = this.addCarparksToMap();
            } else {
                mapdataObj.features = [...mapdataObj.features, ...this.addCarparksToMap()];
            }

            // update mapdata
            if (this.mapdata !== JSON.stringify(mapdataObj)) {
                this.mapdata = JSON.stringify(mapdataObj);
            }
        }
    }

    private addCarparksToMap(): any[] {
        const features = [];
        let managedMSCP, managedSurface, managedBasement, managedAutomated = [];
        let unmanagedMSCP, unmanagedSurface, unmanagedBasement, unmanagedAutomated = [];

        if (this.carparkUnitsManaged && this.carparkUnitsManaged.length > 0) {
            managedMSCP = this.carparkUnitsManaged.filter(unit => unit.type_name === 'MSCP');
            managedSurface = this.carparkUnitsManaged.filter(unit => unit.type_name === 'Surface');
            managedBasement = this.carparkUnitsManaged.filter(unit => unit.type_name === 'Basement');
            managedAutomated = this.carparkUnitsManaged.filter(unit => unit.type_name === 'Automated');
        }

        if (this.carparkUnitsUnManaged && this.carparkUnitsUnManaged.length > 0) {
            unmanagedMSCP = this.carparkUnitsUnManaged.filter(unit => unit.type_name === 'MSCP');
            unmanagedSurface = this.carparkUnitsUnManaged.filter(unit => unit.type_name === 'Surface');
            unmanagedBasement = this.carparkUnitsUnManaged.filter(unit => unit.type_name === 'Basement');
            unmanagedAutomated = this.carparkUnitsUnManaged.filter(unit => unit.type_name === 'Automated');
        }

        // ['Managed_MSCP', 'Managed_Surface', 'Managed_Basement', 'Managed_Automated']
        // managed units
        if (this.carParks.includes('Managed_MSCP') && managedMSCP && managedMSCP.length > 0) {
            managedMSCP.forEach(v => {
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }

                const isArea = JSON.parse(v.connecting_points).length > 0;
                const { geometry, options } = this.defineMarkerProperties(isArea, v);
                const mscp = {
                    type: 'Feature',
                    properties: {
                        options,
                        info: {
                            '<h5>MSCP</h5>Code': v.code,
                            'Name': v.carpark_name,
                            'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                            'Managed by': v.managed_by,
                            'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                            'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                            'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                        }
                    },
                    geometry
                };
                features.push(mscp);

                if (isArea) {
                    const markerProps = this.defineMarkerProperties(!isArea, v);
                    const mscpMarker = {
                        type: 'Feature',
                        properties: {
                            options: markerProps.options,
                            info: {
                                '<h5>MSCP</h5>Code': v.code,
                                'Name': v.carpark_name,
                                'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                                'Managed by': v.managed_by,
                                'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                                'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                                'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                            }
                        },
                        geometry: markerProps.geometry
                    };
                    features.push(mscpMarker);
                }
            });
        }

        if (this.carParks.includes('Managed_Surface') && managedSurface && managedSurface.length > 0) {
            managedSurface.forEach(v => {
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }

                const isArea = JSON.parse(v.connecting_points).length > 0;
                const { geometry, options } = this.defineMarkerProperties(isArea, v);
                const surface = {
                    type: 'Feature',
                    properties: {
                        options,
                        info: {
                            '<h5>Surface</h5>Code': v.code,
                            'Name': v.carpark_name,
                            'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                            'Managed by': v.managed_by,
                            'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                            'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                            'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                        }
                    },
                    geometry
                };
                features.push(surface);

                if (isArea) {
                    const markerProps = this.defineMarkerProperties(!isArea, v);
                    const surfaceMarker = {
                        type: 'Feature',
                        properties: {
                            options: markerProps.options,
                            info: {
                                '<h5>Surface</h5>Code': v.code,
                                'Name': v.carpark_name,
                                'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                                'Managed by': v.managed_by,
                                'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                                'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                                'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                            }
                        },
                        geometry: markerProps.geometry
                    };
                    features.push(surfaceMarker);
                }
            });
        }

        if (this.carParks.includes('Managed_Basement') && managedBasement && managedBasement.length > 0) {
            managedBasement.forEach(v => {
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }

                const isArea = JSON.parse(v.connecting_points).length > 0;
                const { geometry, options } = this.defineMarkerProperties(isArea, v);
                const basement = {
                    type: 'Feature',
                    properties: {
                        options,
                        info: {
                            '<h5>Basement</h5>Code': v.code,
                            'Name': v.carpark_name,
                            'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                            'Managed by': v.managed_by,
                            'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                            'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                            'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                        }
                    },
                    geometry
                };
                features.push(basement);

                if (isArea) {
                    const markerProps = this.defineMarkerProperties(!isArea, v);
                    const basementMarker = {
                        type: 'Feature',
                        properties: {
                            options: markerProps.options,
                            info: {
                                '<h5>Basement</h5>Code': v.code,
                                'Name': v.carpark_name,
                                'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                                'Managed by': v.managed_by,
                                'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                                'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                                'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                            }
                        },
                        geometry: markerProps.geometry
                    };
                    features.push(basementMarker);
                }
            });
        }

        if (this.carParks.includes('Managed_Automated') && managedAutomated && managedAutomated.length > 0) {
            managedAutomated.forEach(v => {
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }

                const isArea = JSON.parse(v.connecting_points).length > 0;
                const { geometry, options } = this.defineMarkerProperties(isArea, v);
                const automated = {
                    type: 'Feature',
                    properties: {
                        options,
                        info: {
                            '<h5>Automated</h5>Code': v.code,
                            'Name': v.carpark_name,
                            'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                            'Managed by': v.managed_by,
                            'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                            'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                            'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                        }
                    },
                    geometry
                };
                features.push(automated);

                if (isArea) {
                    const markerProps = this.defineMarkerProperties(!isArea, v);
                    const automatedMarker = {
                        type: 'Feature',
                        properties: {
                            options: markerProps.options,
                            info: {
                                '<h5>Automated</h5>Code': v.code,
                                'Name': v.carpark_name,
                                'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                                'Managed by': v.managed_by,
                                'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                                'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                                'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                            }
                        },
                        geometry: markerProps.geometry
                    };
                    features.push(automatedMarker);
                }
            });
        }
        // ['Unmanaged_MSCP', 'Unmanaged_Surface', 'Unmanaged_Basement', 'Unmanaged_Automated']
        // unmanaged units
        if (this.carParks.includes('Unmanaged_MSCP') && unmanagedMSCP && unmanagedMSCP.length > 0) {
            unmanagedMSCP.forEach(v => {
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }

                const isArea = JSON.parse(v.connecting_points).length > 0;
                const { geometry, options } = this.defineMarkerProperties(isArea, v);
                const mscp = {
                    type: 'Feature',
                    properties: {
                        options,
                        info: {
                            '<h5>MSCP</h5>Code': v.code,
                            'Name': v.carpark_name,
                            'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                            'Managed by': v.managed_by,
                            'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                            'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                            'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                        }
                    },
                    geometry
                };
                features.push(mscp);

                if (isArea) {
                    const markerProps = this.defineMarkerProperties(!isArea, v);
                    const mscpMarker = {
                        type: 'Feature',
                        properties: {
                            options: markerProps.options,
                            info: {
                                '<h5>MSCP</h5>Code': v.code,
                                'Name': v.carpark_name,
                                'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                                'Managed by': v.managed_by,
                                'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                                'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                                'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                            }
                        },
                        geometry: markerProps.geometry
                    };
                    features.push(mscpMarker);
                }
            });
        }

        if (this.carParks.includes('Unmanaged_Surface') && unmanagedSurface && unmanagedSurface.length > 0) {
            unmanagedSurface.forEach(v => {
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }

                const isArea = JSON.parse(v.connecting_points).length > 0;
                const { geometry, options } = this.defineMarkerProperties(isArea, v);

                const surface = {
                    type: 'Feature',
                    properties: {
                        options,
                        info: {
                            '<h5>Surface</h5>Code': v.code,
                            'Name': v.carpark_name,
                            'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                            'Managed by': v.managed_by,
                            'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                            'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                            'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                        }
                    },
                    geometry
                };
                features.push(surface);

                if (isArea) {
                    const markerProps = this.defineMarkerProperties(!isArea, v);
                    const surfaceMarker = {
                        type: 'Feature',
                        properties: {
                            options: markerProps.options,
                            info: {
                                '<h5>Surface</h5>Code': v.code,
                                'Name': v.carpark_name,
                                'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                                'Managed by': v.managed_by,
                                'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                                'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                                'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                            }
                        },
                        geometry: markerProps.geometry
                    };
                    features.push(surfaceMarker);
                }
            });
        }

        if (this.carParks.includes('Unmanaged_Basement') && unmanagedBasement && unmanagedBasement.length > 0) {
            unmanagedBasement.forEach(v => {
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }

                const isArea = JSON.parse(v.connecting_points).length > 0;
                const { geometry, options } = this.defineMarkerProperties(isArea, v);
                const basement = {
                    type: 'Feature',
                    properties: {
                        options,
                        info: {
                            '<h5>Basement</h5>Code': v.code,
                            'Name': v.carpark_name,
                            'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                            'Managed by': v.managed_by,
                            'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                            'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                            'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                        }
                    },
                    geometry
                };
                features.push(basement);

                if (isArea) {
                    const markerProps = this.defineMarkerProperties(!isArea, v);
                    const basementMarker = {
                        type: 'Feature',
                        properties: {
                            options: markerProps.options,
                            info: {
                                '<h5>Basement</h5>Code': v.code,
                                'Name': v.carpark_name,
                                'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                                'Managed by': v.managed_by,
                                'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                                'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                                'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                            }
                        },
                        geometry: markerProps.geometry
                    };
                    features.push(basementMarker);
                }
            });
        }

        if (this.carParks.includes('Unmanaged_Automated') && unmanagedAutomated && unmanagedAutomated.length > 0) {
            unmanagedAutomated.forEach(v => {
                if (this.project && this.project.id !== v.project_id) {
                    return;
                }

                const isArea = JSON.parse(v.connecting_points).length > 0;
                const { geometry, options } = this.defineMarkerProperties(isArea, v);

                const automated = {
                    type: 'Feature',
                    properties: {
                        options,
                        info: {
                            '<h5>Automated</h5>Code': v.code,
                            'Name': v.carpark_name,
                            'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                            'Managed by': v.managed_by,
                            'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                            'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                            'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                        }
                    },
                    geometry
                };
                features.push(automated);

                if (isArea) {
                    const markerProps = this.defineMarkerProperties(!isArea, v);
                    const automatedMarker = {
                        type: 'Feature',
                        properties: {
                            options: markerProps.options,
                            info: {
                                '<h5>Automated</h5>Code': v.code,
                                'Name': v.carpark_name,
                                'Type': (this.allCarparkTypes.find(type => type.id === v.type_id)).name,
                                'Managed by': v.managed_by,
                                'Terminal': (this.allTerminals.find(terminal => terminal.id === v.terminal_id)).terminal_name,
                                'Zone': (this.allZones.find(zone => zone.id === v.zone_id)).zone_name,
                                'Project': (this.allProjects.find(p => p.id === v.project_id)).project_name,
                            }
                        },
                        geometry: markerProps.geometry
                    };
                    features.push(automatedMarker);
                }
            });
        }
        return features;
    }

    private defineMarkerProperties(isArea: boolean, item: any): any {
        if (isArea) {
            return {
                geometry: {
                    type: 'Polygon',
                    coordinates: [JSON.parse(item.connecting_points)]
                },
                options: {
                    color: 'blue',
                    fillOpacity: 0,
                    weight: 3,
                }
            };
        } else {
            return {
                geometry: {
                    type: 'Point',
                    coordinates: [item.latitude, item.longitude]
                },
                options: {
                    icon: {
                        options: {
                            iconUrl: '/assets/project-setup/Parking_active.svg',
                            iconRetinaUrl: '/assets/project-setup/Parking_active.svg',
                            iconSize: [36, 36],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            tooltipAnchor: [16, -28],
                            shadowSize: [48, 48]
                        }, _initHooksCalled: true
                    }
                }
            };
        }
    }

    private deleteEnforcement(res: any) {
        // To retrieve an object of the mapdata
        const jsonFeatures = JSON.parse(this.mapdata);

        // To check if the enforcer 'res' is already on mapdata (return -1 if not)
        const index = jsonFeatures.features.findIndex(marker => {
            return marker.properties.info.Username === res.username;
        });

        jsonFeatures.features.splice(index, 1);

        if (res.usertype === 'Enforcer') {
            const indexEn = this.enforcers.findIndex(i => i.username === res.username);
            this.enforcers.splice(indexEn, 1);

        } else if (res.usertype === 'EOD') {
            const indexEO = this.eods.findIndex(i => i.username === res.username);
            this.eods.splice(indexEO, 1);

        } else if (res.usertype === 'Driver') {
            const indexDr = this.drivers.findIndex(i => i.username === res.username);
            this.drivers.splice(indexDr, 1);

        } else if (res.usertype === 'Clamper') {
            const indexCl = this.clampers.findIndex(i => i.username === res.username);
            this.clampers.splice(indexCl, 1);
        }

        this.mapdata = JSON.stringify(jsonFeatures);
    }

    private addEnforcer() {
        // TODO Filter the enforcer by project
        this.enforcers.forEach(e => {
            // To retrieve an object of the mapdata
            const jsonFeatures = JSON.parse(this.mapdata);
            // To check if the enforcer 'e' is already on mapdata (return -1 if not)
            const index = jsonFeatures.features.findIndex(marker => {
                // return marker.properties.info.Username === e.username;
                return marker.properties.info['<h5>Enforcer </h5>Employee ID'] === e.employee_id;
            });

            const iconUrl = this.updateEnforcerMarker('enforcer', e.status_name);

            const enforcerMarker = {
                type: 'Feature',
                properties: {
                    options: {
                        icon: {
                            options: {
                                iconUrl: iconUrl,
                                iconRetinaUrl: iconUrl,
                                iconSize: [48, 48],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                tooltipAnchor: [16, -28],
                                shadowSize: [48, 48]
                            },
                            _initHooksCalled: true
                        }
                    },
                    info: { // info fro enforcer Marker popup
                        '<h5>Enforcer </h5>Employee ID': e.employee_id, // title between the h5
                        'Full name': `${e.full_name}`,
                        'Phone': e.phone,
                        'Status': e.status_name,
                        'Current Project': e.project_name,
                        'Job Position': e.position,
                        'Device IMEI': e.imei,
                        'Battery Level': `${e.battery_level}%`
                        // 'Latitude': e.latitude,
                        // 'Longitude': e.longitude,
                    }
                },
                geometry: {
                    type: 'Point',
                    coordinates: [e.latitude, e.longitude]
                }
            };

            // Update or add the enforcer
            if (index !== -1) {
                jsonFeatures.features[index] = enforcerMarker;
            } else {
                jsonFeatures.features.push(enforcerMarker);
            }

            this.mapdata = JSON.stringify(jsonFeatures);
        });
    }

    private addEod() {
        // TODO Filter the enforcer by project
        this.eods.forEach(e => {
            // To retrieve an object of the mapdata
            const jsonFeatures = JSON.parse(this.mapdata);

            // To check if the eod 'e' is already on mapdata (return -1 if not)
            const index = jsonFeatures.features.findIndex(marker => {
                // return marker.properties.info.Username === e.username;
                return marker.properties.info['<h5>EOD </h5>Employee ID'] === e.employee_id;
            });
            const iconUrl = this.updateEnforcerMarker('eod', e.status_name);
            const eodMarker = {
                type: 'Feature',
                properties: {
                    options: {
                        icon: {
                            options: {
                                iconUrl: iconUrl,
                                iconRetinaUrl: iconUrl,
                                iconSize: [48, 48],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                tooltipAnchor: [16, -28],
                                shadowSize: [48, 48]
                            },
                            _initHooksCalled: true
                        }
                    },
                    info: { // info fro enforcer Marker popup
                        '<h5>Enforcer </h5>Employee ID': e.employee_id, // title between the h5
                        'Full name': `${e.full_name}`,
                        'Phone': e.phone,
                        'Status': e.status_name,
                        'Current Project': e.project_name,
                        'Job Position': e.position,
                        'Car Plate': e.car_plate,
                        'Device IMEI': e.imei,
                        'Battery Level': `${e.battery_level}%`
                        // 'Latitude': e.latitude,
                        // 'Longitude': e.longitude,
                    }
                },
                geometry: {
                    type: 'Point',
                    coordinates: [e.latitude, e.longitude]
                }
            };

            // Update or add the eod
            if (index !== -1) {
                jsonFeatures.features[index] = eodMarker;
            } else {
                jsonFeatures.features.push(eodMarker);
            }

            this.mapdata = JSON.stringify(jsonFeatures);
        });
    }

    private addDriver() {
        // TODO Filter the enforcer by project
        this.drivers.forEach(e => {
            // To retrieve an object of the mapdata
            const jsonFeatures = JSON.parse(this.mapdata);

            // To check if the enforcer 'e' is already on mapdata (return -1 if not)
            const index = jsonFeatures.features.findIndex(marker => {
                // return marker.properties.info.Username === e.username;
                return marker.properties.info['<h5>Driver </h5>Employee ID'] === e.employee_id;
            });
            const iconUrl = this.updateEnforcerMarker('driver', e.status_name);

            const driverMarker = {
                type: 'Feature',
                properties: {
                    options: {
                        icon: {
                            options: {
                                iconUrl: iconUrl,
                                iconRetinaUrl: iconUrl,
                                iconSize: [48, 48],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                tooltipAnchor: [16, -28],
                                shadowSize: [48, 48]
                            },
                            _initHooksCalled: true
                        }
                    },
                    info: { // info fro enforcer Marker popup
                        '<h5>Driver </h5>Employee ID': e.employee_id, // title between the h5
                        'Full name': e.full_name,
                        'Phone': e.phone,
                        'Current Project': e.project_name,
                        'Position': e.position,
                        'Status': e.status_name,
                        'Car Plate': e.car_plate,
                        'Device IMEI': e.imei,
                        'Battery Level': `${e.battery_level}%`
                        // 'Latitude': e.latitude,
                        // 'Longitude': e.longitude,
                    }
                },
                geometry: {
                    type: 'Point',
                    coordinates: [e.latitude, e.longitude]
                }
            };

            // Update or add the driver
            if (index !== -1) {
                jsonFeatures.features[index] = driverMarker;
            } else {
                jsonFeatures.features.push(driverMarker);
            }

            this.mapdata = JSON.stringify(jsonFeatures);
        });
    }

    private addClamper() {
        // TODO Filter the enforcer by project
        this.clampers.forEach(e => {

            // To retrieve an object of the mapdata
            const jsonFeatures = JSON.parse(this.mapdata);

            // To check if the enforcer 'e' is already on mapdata (return -1 if not)
            const index = jsonFeatures.features.findIndex(marker => {
                return marker.properties.info.Username === e.username;
            });

            const clamperMarker = {
                type: 'Feature',
                properties: {
                    options: {
                        icon: {
                            options: {
                                iconUrl:
                                    '/assets/Icons/Projects_section/Project list/clamp van.svg',
                                iconRetinaUrl:
                                    '/assets/Icons/Projects_section/Project list/clamp van.svg',
                                iconSize: [48, 48],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                tooltipAnchor: [16, -28],
                                shadowSize: [48, 48]
                            },
                            _initHooksCalled: true
                        }
                    },
                    info: { // info fro enforcer Marker popup
                        '<h5>Clamper </h5>ID': e.user_id, // title between the h5
                        'Project ID': e.project_id,
                        'Firstname': e.firstname,
                        'Lastname': e.lastname,
                        'Phone': e.phone,
                        'Site ID': e.site_id,
                        'User ID': e.user_id,
                        'Username': e.username,
                        'Usertype': e.usertype
                    }
                },
                geometry: {
                    type: 'Point',
                    coordinates: [e.latitude, e.longitude]
                }
            };

            // Update or add the enforcer
            if (index !== -1) {
                jsonFeatures.features[index] = clamperMarker;
            } else {
                jsonFeatures.features.push(clamperMarker);
            }

            this.mapdata = JSON.stringify(jsonFeatures);
        });
    }

    public checkEnableFilter() {
        return !this.project || (this.project.has_on_street || this.project.has_car_park || this.project.has_enforcement);
    }

    openFilterDialog() {
        const data: any = {
            'onStreets': this.onStreets,
            'carParks': this.carParks,
            'enforcement': this.enforcement,
            'enforcementCRM': this.enforcementCRM
        };

        if (!!this.project) {
            data.project = { ...this.project };
        }
        const dialogRef = this.dialog.open(FilterdialogComponent, {
            width: '70%',
            data
        });

        dialogRef.afterClosed().subscribe(filters => {
            if (filters) {
                const key = this.project ? this.project.id : 'global';
                this.filterService.save(filters, key);
                this.setFilters(filters);
                this.isHeatMapView = false;
                this.submit = 0;
                this.loadMapData();
            }
        });
    }

    /**
     * Method enclenched on click on the "eye button" to display the heatmap
     */
    public onHeatMapView() {
        this.isHeatMapView = !this.isHeatMapView;
        if (this.isHeatMapView) {
            this.submit = 0;
        }
    }

    onSubmit() {
        this.submit++;
    }

    private convertToISOString(byEndOfDay: boolean): string {
        const date = new Date();
        if (byEndOfDay) {
            date.setHours(23, 59, 59, 999);
        } else {
            date.setHours(0, 0, 0, 0);
        }
        return date.toISOString();
    }

    private updateFiltersByStorage() {
        const key = this.project ? this.project.id : 'global';
        const savedFilters = this.filterService.get(key);
        if (savedFilters) {
            this.setFilters(savedFilters);
        }
    }

    private setFilters(filters) {
        this.onStreets = filters.selectedOnStreets;
        this.carParks = filters.selectedCarParks;
        this.enforcement = filters.selectedEnforcement;
        this.enforcementCRM = filters.selectedEnforcementCRM;
    }

    private updateEnforcerMarker(type, statusName) {
        // Get color from the list_enforcer_status by name_en
        const enforcerStatus = this.listEnforcerStatus.filter( item => {
            return item.name_en === statusName;
        });
        // Get the color matched to the job status
        const updatedColor = enforcerStatus.length > 0 ? enforcerStatus[0].color : '#023B41';
        // Read the original SVG from the resource by type(enforcer, driver, eod);
        const enforcer = this.makerupSVG[type];
        // Update fill color from the original SVG
        const updatedOriginalMarker = this.commonService.updateFillColor(enforcer, updatedColor);
        // Return the encoded tiny url from the SVG
        const updatedMarker = this.commonService.svgToTinyDataUri(updatedOriginalMarker);
        return updatedMarker;
    }
}
