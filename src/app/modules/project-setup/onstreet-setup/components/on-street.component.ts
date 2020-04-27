import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import {gOnStreetItmes, OnStreetItem, OnStreetType} from '../../common-setup/models/on-street.model';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {PgParkingsService} from '../../common-setup/services/onstreet/parking.service';
import {PgProjectOpenLandService} from '../../common-setup/services/onstreet/project-openland.service';
import {PgProjectZoneService} from '../../common-setup/services/onstreet/project-zone.service';
import MapOptions from '../../../../shared/classes/MapOptions';
import {ProjectZone} from '../../common-setup/models/onstreet/project_zone.model';
import {Parking} from '../../common-setup/models/onstreet/parking.model';
import {ProjectOpenLand} from '../../common-setup/models/onstreet/project_openland.model';
import {forkJoin} from 'rxjs';
import {BaseOnStreetComponent} from '../../common-setup/components/onstreet/base-onstreet/base-onstreet.component';
import {PgProjectsService} from '../../../../components/projects/services/projects.service';
import {Project} from '../../../../components/projects/models/project.model';
import {PgAssetService} from '../../../../components/assets/services/assets.service';
import {Asset} from '../../../../components/assets/models/asset.model';

@Component({
  selector: 'app-on-street',
  templateUrl: './on-street.component.html',
  styleUrls: ['./on-street.component.scss']
})
export class OnStreetComponent implements OnInit {

  @ViewChild('child')
  public child: BaseOnStreetComponent;

  OnStreetType = OnStreetType;
  types = gOnStreetItmes;
  selectedType: OnStreetItem;
  projectId: number;
  filter: string;
  mapCenter: any;
  mapOptions = new MapOptions(true, false, false, false, false, {lat: 48.864716, lng: 2.349014});
  mapdata = '';
  clusterMapData = '';
  mapdrawdata = '';
  zones: ProjectZone[];
  parkings: Parking[];
  openLands: ProjectOpenLand[];
  parkingMeters: Asset[];
  signages: Asset[];
  filterLists: string[] = ['Parking', 'Signage', 'Parking Meter', 'Zone', 'Open Land'];
  selectedOptions: string[] = ['All', 'Parking', 'Signage', 'Parking Meter', 'Zone', 'Open Land'];
  project: Project;
  public isListModeOn = false;

  constructor(
    private domSanitizer: DomSanitizer,
    public matIconRegistry: MatIconRegistry,
    private readonly location: Location,
    private route: ActivatedRoute,
    private readonly parkingService: PgParkingsService,
    private readonly projectOpenLandService: PgProjectOpenLandService,
    private readonly assetService: PgAssetService,
    private readonly projectZoneService: PgProjectZoneService,
    private readonly projectService: PgProjectsService,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {
    this.matIconRegistry.addSvgIcon('maps', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/enforcementsetup/map_view_icon.svg'));

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId = params['id'];
        this.projectService.getProjectById(this.projectId).subscribe(res => {
          if (res) {
            this.project = res;
            this.mapCenter = [this.project.center_latitude, this.project.center_longitude];
          }
        });
      }
    });
  }

  ngOnInit() {
    this.getAllItems();
  }

  public onSelectType(type?: OnStreetItem) {
    this.selectedType = type;
    if (type) {
      this.selectedOptions = [type.name];
    }
    window.scrollTo(0, 0);
  }

  public onBack() {
    this.location.back();
  }

  public applyFilterAssets(filter: string) {
    this.filter = filter;
    this.loadMapData(this.filter);
  }

  private getAllItems() {
    forkJoin(
      this.parkingService.getWithDetails({project_id: this.projectId}),
      this.projectOpenLandService.getWithDetails({project_id: this.projectId}),
      this.assetService.getByZones({project_id: this.projectId, type_asset: 'Parking Meter', status: 'Installed'}),
      this.assetService.getByZones({project_id: this.projectId, type_asset: 'Signage', status: 'Installed'}),
      this.projectZoneService.getWithProject({project_id: this.projectId})
    ).subscribe(res => {
      const [parking, openLand, parkingMeter, signage, zone] = res;

      this.parkings = parking;
      this.openLands = openLand;
      this.parkingMeters = parkingMeter;
      this.signages = signage;
      this.zones = zone;
      this.loadMapData(this.filter);
    });
  }

  private loadMapData(filter: string = '') {

    const mapdataObj = {
      features: []
    };
    const clusterMapDataObj: any = {
      parkings: {features: []},
      parkingMeters: {features: []},
      signages: {features: []},
      zones: {features: []},
      openLands: {features: []},
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

    // Parking
    parkings.forEach(v => {
      // geoJSON Feature format - Point
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
      clusterMapDataObj['parkings']['features'].push(parkingMarker);
    });

    // Display parkingMeters
    parkingMeters.forEach(v => {
      const icon = v.img_url
        ? v.img_url.startsWith('uploads')
          ? this.apiEndpoint + '/' + v.img_url
          : v.img_url
        : v.model_img_url || 'No Icon';

      // geoJSON Feature format - Point
      const parkingMeterMarker = {
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
          info: { // info for the popup parcmeter
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
        parkingMeterMarker.properties.info['Zone'] = v['zone_name'];
      }
      mapdataObj.features.push(parkingMeterMarker);
      clusterMapDataObj['parkingMeters']['features'].push(parkingMeterMarker);
    });

    // Display Signages
    signages.forEach( v => {
      const icon = v.img_url
        ? v.img_url.startsWith('uploads')
          ? this.apiEndpoint + '/' + v.img_url
          : v.img_url
        : v.model_img_url || 'No Icon';

      // geoJSON Feature format - Point
      const signageMarker = {
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
          info: { // info popup Signage
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
        signageMarker.properties.info['Zone'] = v['zone_name'];
      }
      if (!!v['city_txt']) {
        signageMarker.properties.info['City'] = v['city_txt'];
      }
      mapdataObj.features.push(signageMarker);
      clusterMapDataObj['signages']['features'].push(signageMarker);
    });

    // Display Open Lands
    openLands.forEach( v => {
      // geoJSON Feature format - Polygon
      const openLandMarker = {
        type: 'Feature',
        properties: {
          options: {
            color: 'red',
            weight : 3,
          },
          info: { // info for the popup Open Lands
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
        openLandMarker.properties.info['Zone'] = v['zone_name'];
      }
      if (!!v['project_name']) {
        openLandMarker.properties.info['Project'] = v['project_name'];
      }
      mapdataObj.features.push(openLandMarker);
      clusterMapDataObj['openLands']['features'].push(openLandMarker);
    });

    // Display Zones
    zones.forEach( v => {
      // geoJSON Feature format - Polygon
      const zoneMarker = {
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
        zoneMarker.properties.info['Project'] = v['project_name'];
      }
      mapdataObj.features.push(zoneMarker);
      clusterMapDataObj['zones']['features'].push(zoneMarker);
    });

    this.mapdata = JSON.stringify(mapdataObj);
    this.clusterMapData = JSON.stringify(clusterMapDataObj);
  }

  public onSelection(e: any, v: any) {
    // set map mode
    this.isListModeOn = false;
    this.onSelectType();

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

  public onAdd(selectedOptions?) {
    this.isListModeOn = false;
    //  this.child.onAdd();
    if (selectedOptions) {
      this.onSelectType(gOnStreetItmes.filter((item: OnStreetItem) => item.type === +OnStreetType[selectedOptions[0].replace(/\s/g, '')])[0]);
    }
  }

  /** change display mode */
  public onChangeDisplayMode(selectedOptions): void {
    const gItemOnStreet: OnStreetItem = gOnStreetItmes.filter((item: OnStreetItem) => item.type === +OnStreetType[selectedOptions[0].replace(/\s/g, '')])[0];
    if (this.isListModeOn) {
      this.isListModeOn = false;
      this.onSelectType(gItemOnStreet);
    } else {
      this.isListModeOn = true;
      this.onSelectType(gItemOnStreet);
    }
  }
}
