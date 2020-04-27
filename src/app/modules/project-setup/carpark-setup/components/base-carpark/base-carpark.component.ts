import {AbstractControl, FormGroup} from '@angular/forms';

import {ProjectZone, EmptyPrZone} from 'app/modules/project-setup/common-setup/models/onstreet/project_zone.model';
import MapOptions, {MapZoom} from '../../../../../shared/classes/MapOptions';
import {Assets, EmptyGate, EmptyLane, EmptyParking, EmptyParkLevel, EmptyParkZone, EmptyParkSpace, EmptyTerminal, Gate, Lane, Parking, ParkLevel, ParkSpace, ParkZone, Terminal} from '../../models/carpark-items.model';
import {Asset} from 'app/components/assets/models/asset.model';
import {CarparkAsset, CarparkItemLevel, CarparkItems} from '../../models/carpark.model';
import {environment} from 'environments/environment';

import {CarparkDataService} from '../../services/carpark-data.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkService} from '../../services/carpark.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {GateService} from '../../services/gate.service';
import {LaneService} from '../../services/lane.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {CarparkAssetsService} from '../../services/carpark-assets.service';
import {ToastrService} from 'ngx-toastr';
import {Subject} from 'rxjs';
import * as L from 'leaflet';

export const RADIUS = 6378137;

export abstract class BaseCarparkComponent {
  public EmptyPrZone = EmptyPrZone;
  public EmptyTerminal = EmptyTerminal;
  public EmptyParking = EmptyParking;
  public EmptyParkLevel = EmptyParkLevel;
  public EmptyParkZone = EmptyParkZone;
  public EmptyGate = EmptyGate;
  public EmptyLane = EmptyLane;
  public EmptyParkSpace = EmptyParkSpace;

  public mapOptions: MapOptions;
  public mapZoomValue = MapZoom.Project;
  public mapCenter: any;

  public tabMapDataJSON = '';
  public tabMapDrawDataJSON = '';
  public tabMapImgOverlayDataJSON = '';

  public filter = '';
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  public apiEndpoint = environment.apiBase;
  public baseURL = environment.baseAssetsUrl;

  filterLists: string[] = CarparkItems.map(el => el.name);
  selectedOptions: string[] = ['All', ...this.filterLists];

  get projectCenter(): any {
    return this.dataService.projectCenter;
  }
  set projectCenter(center: any) {
    this.dataService.projectCenter = center;
  }

  public inputCheck(event: any) {
    const pattern = /[a-zA-Z0-9\/\ ]/;
    const inputChar = event.keyCode ? String.fromCharCode(event.keyCode) : (event.clipboardData).getData('text');
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  get allZones(): ProjectZone[] {
    return this.dataService.allZones;
  }
  set allZones(zones: ProjectZone[]) {
    this.dataService.allZones = zones;
  }

  get allTerminals(): Terminal[] {
    return this.dataService.allTerminals;
  }
  set allTerminals(terminal: Terminal[]) {
    this.dataService.allTerminals = terminal;
  }
  get terminals(): Terminal[] {
    return this.dataService.terminals;
  }
  set terminals(terminal: Terminal[]) {
    this.dataService.terminals = terminal;
  }

  get allParkings(): Parking[] {
    return this.dataService.allParkings;
  }
  set allParkings(parking: Parking[]) {
    this.dataService.allParkings = parking;
  }
  get parkings(): Parking[] {
    return this.dataService.parkings;
  }
  set parkings(parking: Parking[]) {
    this.dataService.parkings = parking;
  }

  get allParkLevels(): ParkLevel[] {
    return this.dataService.allParkLevels;
  }
  set allParkLevels(parkLevels: ParkLevel[]) {
    this.dataService.allParkLevels = parkLevels;
  }
  get parkLevels(): ParkLevel[] {
    return this.dataService.parkLevels;
  }
  set parkLevels(parkLevels: ParkLevel[]) {
    this.dataService.parkLevels = parkLevels;
  }

  get allParkZones(): ParkZone[] {
    return this.dataService.allParkZones;
  }
  set allParkZones(parkZones: ParkZone[]) {
    this.dataService.allParkZones = parkZones;
  }
  get parkZones(): ParkZone[] {
    return this.dataService.parkZones;
  }
  set parkZones(parkZones: ParkZone[]) {
    this.dataService.parkZones = parkZones;
  }

  get allParkSpaces(): ParkSpace[] {
    return this.dataService.allParkSpaces;
  }
  set allParkSpaces(parkSpaces: ParkSpace[]) {
    this.dataService.allParkSpaces = parkSpaces;
  }
  get parkSpaces(): ParkSpace[] {
    return this.dataService.parkSpaces;
  }
  set parkSpaces(parkSpaces: ParkSpace[]) {
    this.dataService.parkSpaces = parkSpaces;
  }

  get allGates(): Gate[] {
    return this.dataService.allGates;
  }
  set allGates(gates: Gate[]) {
    this.dataService.allGates = gates;
  }
  get gates(): Gate[] {
    return this.dataService.gates;
  }
  set gates(gates: Gate[]) {
    this.dataService.gates = gates;
  }

  get allLanes(): Lane[] {
    return this.dataService.allLanes;
  }
  set allLanes(lanes: Lane[]) {
    this.dataService.allLanes = lanes;
  }
  get lanes(): Lane[] {
    return this.dataService.lanes;
  }
  set lanes(lanes: Lane[]) {
    this.dataService.lanes = lanes;
  }
  get allAssets(): Assets[] {
    return this.dataService.allAssets;
  }
  set allAssets(assets: Assets[]) {
    this.dataService.allAssets = assets;
  }
  get assets(): Assets[] {
    return this.dataService.assets;
  }
  set assets(assets: Assets[]) {
    this.dataService.assets = assets;
  }
  get selectedZone(): ProjectZone {
    return this.dataService.getProjectZone();
  }
  set selectedZone(zone: ProjectZone) {
    this.dataService.selectProjectZone(zone);
    this.selectedTerminal = new Terminal();
    this.terminals = [];
    this.selectedParking = new Parking();
    this.parkings = [];
    this.selectedParkLevel = new ParkLevel();
    this.parkLevels = [];
    this.selectedParkZone = new ParkZone();
    this.parkZones = [];
    this.selectedParkSpace = new ParkSpace();
    this.parkSpaces = [];
    this.selectedGate = new Gate();
    this.gates = [];
    this.selectedLane = new Lane();
    this.lanes = [];
    this.selectedAsset = new Assets();
    this.assets = [];

    if (zone && zone.id) {
      // Case: A zone selected
      if (this.allTerminals && this.allTerminals.length >= 0) {
        this.terminals = this.allTerminals.filter(el => el.zone_id === zone.id);
      } else {
        this.terminalService.getByProjectZone(this.selectedZone.id)
          .then(res => this.terminals = res)
          .catch(err => this.APIErrorHandler(err, 'Failed to load terminals of this zone!'));
      }
    } else {
      // Case: All zone selected
      this.terminals = this.allTerminals;
    }
  }

  get selectedTerminal(): Terminal {
    return this.dataService.getTerminal();
  }
  set selectedTerminal(terminal: Terminal) {
    this.dataService.selectTerminal(terminal);
    this.selectedParking = new Parking();
    this.parkings = [];
    this.selectedParkLevel = new ParkLevel();
    this.parkLevels = [];
    this.selectedParkZone = new ParkZone();
    this.parkZones = [];
    this.selectedParkSpace = new ParkSpace();
    this.parkSpaces = [];
    this.selectedGate = new Gate();
    this.gates = [];
    this.selectedLane = new Lane();
    this.lanes = [];
    this.selectedAsset = new Assets();
    this.assets = [];

    if (terminal && terminal.id) {
      // Case: A terminal selected
      // TODO: Logic in case Project has no terminal
      if (this.allParkings && this.allParkings.length >= 0) {
        this.parkings = this.allParkings.filter(p => p.terminal_id === terminal.id);
      } else {
        this.carparkService.getAllByProjectZone(this.selectedZone.id)
          .takeUntil(this.destroy$)
          .subscribe(parkings => {
            this.parkings = parkings;
          }, err => this.APIErrorHandler(err, 'Failed to load carparks of this zone!'));
      }
    } else {
      // Case: All terminal selected
      this.parkings = this.allParkings;
    }
  }

  get selectedParking(): Parking {
    return this.dataService.getParking();
  }
  set selectedParking(parking: Parking) {
    this.dataService.selectParking(parking);
    this.selectedParkLevel = new ParkLevel();
    this.parkLevels = [];
    this.selectedParkZone = new ParkZone();
    this.parkZones = [];
    this.selectedParkSpace = new ParkSpace();
    this.parkSpaces = [];
    this.selectedGate = new Gate();
    this.gates = [];
    this.selectedLane = new Lane();
    this.lanes = [];
    this.selectedAsset = new Assets();
    this.assets = [];

    if (parking && parking.id) {
      // Case: A carpark selected
      if (this.allParkLevels && this.allParkLevels.length >= 0) {
        this.parkLevels = this.allParkLevels.filter(t => t.carpark_id === this.selectedParking.id);
      } else {
        this.carparkLevelService.getAllByCarpark(this.selectedParking.id)
          .takeUntil(this.destroy$)
          .subscribe(levels => {
            this.parkLevels = levels;
          }, err => this.APIErrorHandler(err, 'Failed to load levels of this carpark!'));
      }
    } else {
      // Case: All carpark selected
      this.parkLevels = this.allParkLevels;
    }
  }

  get selectedParkLevel(): ParkLevel {
    return this.dataService.getParkLevel();
  }
  set selectedParkLevel(parkLevel: ParkLevel) {
    this.dataService.selectParkLevel(parkLevel);
    this.selectedParkZone = new ParkZone();
    this.parkZones = [];
    this.selectedParkSpace = new ParkSpace();
    this.parkSpaces = [];
    this.selectedGate = new Gate();
    this.gates = [];
    this.selectedLane = new Lane();
    this.lanes = [];
    this.selectedAsset = new Assets();
    this.assets = [];

    if (parkLevel && parkLevel.id) {
      // Case: A level selected
      if (this.allParkZones && this.allParkZones.length >= 0) {
        this.parkZones = this.allParkZones
          .filter(t => t.level_id === this.selectedParkLevel.id);
      } else {
        // TODO: getAllByCarparkLevel() or getAllByCarpark()
        this.carparkZoneService.getAllByCarpark(this.selectedParking.id)
          .then(res => {
            this.parkZones = res;
          })
          .catch(err => this.APIErrorHandler(err, 'Failed to load park zones of this carpark!'));
      }
    } else {
      // Case: All levels selected
      this.parkZones = this.allParkZones;
    }
  }

  get selectedParkZone(): ParkZone {
    return this.dataService.getParkZone();
  }
  set selectedParkZone(parkZone: ParkZone) {
    this.dataService.selectParkZone(parkZone);
    this.selectedParkSpace = new ParkSpace();
    this.parkSpaces = [];
    this.selectedGate = new Gate();
    this.gates = [];
    this.selectedLane = new Lane();
    this.lanes = [];
    this.selectedAsset = new Assets();
    this.assets = [];

    if (parkZone && parkZone.id) {
      // Case: A parkzone selected
      if (this.allGates && this.allGates.length >= 0) {
        this.gates = this.allGates
          .filter(t => t.carpark_zone_id === this.selectedParkZone.id);
      } else {
        this.gateService.getByCarparkZone(this.selectedParkZone.id)
          .then(res => {
            this.gates = res;
          })
          .catch(err => this.APIErrorHandler(err, 'Failed to load gates of this park zone!'));
      }

      if (this.allParkSpaces && this.allParkSpaces.length >= 0) {
        this.parkSpaces = this.allParkSpaces
          .filter(t => t.carpark_zone_id === this.selectedParkZone.id);
      } else {
        this.parkSpaceService.getByCarparkZone(this.selectedParkZone.id)
          .then(res => {
            this.parkSpaces = res;
          });
      }

      if (this.allAssets && this.allAssets.length >= 0) {
        this.assets = this.allAssets
          .filter(t => t.carpark_zone_id === this.selectedParkZone.id);
      } else {
        this.carparkAssetsService.getByParkZone(this.selectedParkZone.id, this.selectedAssetType.code)
          .then(res => {
            this.assets = res;
          })
          .catch(err => this.APIErrorHandler(err, 'Failed to load assets of this park zone!'));
      }
    } else {
      // Case: All parkzones selected
      this.gates = this.allGates;
      this.assets = this.allAssets;
      this.parkSpaces = this.allParkSpaces;
    }
  }

  get selectedGate(): Gate {
    return this.dataService.getGate();
  }
  set selectedGate(gate: Gate) {
    this.dataService.selectGate(gate);
    this.selectedLane = new Lane();
    this.lanes = [];

    if (gate && gate.id) {
      // Case: A gate selected
      if (this.allLanes && this.allLanes.length >= 0) {
        this.lanes = this.allLanes.filter(t => t.gate_id === this.selectedGate.id);
      } else {
        this.laneService.getByGate(this.selectedZone.id)
          .then(res => {
            this.lanes = res;
          })
          .catch(err => this.APIErrorHandler(err, 'Failed to load lanes of this gate!'));
      }
    } else {
      // Case: All gates selected
      this.lanes = this.allLanes;
    }
  }

  get selectedLane(): Lane {
    return this.dataService.getLane();
  }
  set selectedLane(lane: Lane) {
    this.dataService.selectLane(lane);
  }

  get selectedAsset(): Assets {
    return this.dataService.getAsset();
  }
  set selectedAsset(assets: Assets) {
    this.dataService.selectAsset(assets);
  }

  get selectedAssetType(): CarparkAsset {
    return this.dataService.getAssetType();
  }
  set selectedAssetType(type: CarparkAsset) {
    this.dataService.selectAssetType(type);
  }

  get selectedParkSpace(): ParkSpace {
    return this.dataService.getParkSpace();
  }
  set selectedParkSpace(parkSpace: ParkSpace) {
    this.dataService.selectParkSpace(parkSpace);
  }

  /**
   * ProjectZone GeoJSON: Feature format - Polygon
   * @param v
   * @param editable
   * @param active
   */
  private static projectZoneGeoJSON(v: ProjectZone, editable: boolean, active: boolean) {
    // the info for the popup zone
    const info = {
      '<h5>Zone</h5>ID': v.id,
      'Zone Code': v.zone_code,
      'Project ID': v.project_id,
      'Zone Name': v.zone_name,
      'Perimeter': v.perimeter.toLocaleString(['ban', 'id']) + ' ( ' + v.measurement_unit + ' )',
      'Area': v.area.toLocaleString(['ban', 'id']) + ' ( Sq ' + v.measurement_unit + ' )',
    };

    return {
      type: 'Feature',
      properties: {
        options: active
          ? { color: '#ff7800', fillOpacity: 0.2, weight : 3 }
          : { color: 'orange', fillOpacity: 0, weight : 2 },
        info: info,
        value: v,
        editable: editable || false
      },
      geometry: { type: 'Polygon', coordinates: [this.parseConnectingPoints(v.connecting_points)] }
    };
  }

  /**
   * Terminal GeoJSON: Feature format - Polygon & Point
   * @param v
   * @param editable
   * @param active
   */
  private static terminalGeoJSON(v: Terminal, editable: boolean, active: boolean) {
    // info for popup of icon terminal
    const info = {
      '<h5>Terminal</h5>ID': v.id,
      'Code': v.terminal_code,
      'Name': v.terminal_name,
      'Airport Code': v.airport_code,
      'Airport Name': v.airport_name,
      'Zone ID': v.zone_id,
      'Info notes': v.notes,
    };

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            options: active
              ? { color: '#ff7800', fillOpacity: 0.25, weight : 3 }
              : { color: 'orange', fillOpacity: 0, weight : 2 },
            value: v,
            info: info,
            editable: editable || false
          },
          geometry: { type: 'Polygon', coordinates: [this.parseConnectingPoints(v.connecting_points)] }
        },
        {
          type: 'Feature',
          properties: {
            options: { icon: { options: {
                  iconUrl: active
                    ? '/assets/project-setup/Terminal_selected.svg'
                    : '/assets/project-setup/Terminal_active.svg',
                  iconRetinaUrl: active
                    ? '/assets/project-setup/Terminal_selected.svg'
                    : '/assets/project-setup/Terminal_active.svg',
                  iconSize: [36, 36],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  tooltipAnchor: [16, -28],
                  shadowSize: [36, 36]
                }, _initHooksCalled: true } },
            info: info,
            value: v,
            editable: editable || false
          },
          geometry: {
            type: 'Point',
            coordinates: [v.latitude, v.longitude]
          }
        }
      ],
    };
  }

  /**
   * Carpark GeoJSON: Feature format - Polygon & Point
   * @param v
   * @param editable
   * @param active
   */
  private static parkingGeoJSON(v: Parking, editable: boolean, active: boolean) {
    // info for popup of icon parking
    const info = {
      '<h5>Parking</h5>ID': v.id,
      'Parking code': v.code,
      'Name': v.carpark_name,
      'Zone ID': v.zone_id,
    };

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            options: active
              ? { color: '#ff7800', fillOpacity: 0.5, weight : 3 }
              : { color: 'orange', fillOpacity: 0, weight : 3 },
            value: v,
            info: info,
            editable: editable || false
          },
          geometry: { type: 'Polygon', coordinates: [this.parseConnectingPoints(v.connecting_points)] }
        },
        {
          type: 'Feature',
          properties: {
            options: { icon: { options: {
                  iconUrl: active
                    ? '/assets/project-setup/Parking_selected.svg'
                    : '/assets/project-setup/Parking_active.svg',
                  iconRetinaUrl: active
                    ? '/assets/project-setup/Parking_selected.svg'
                    : '/assets/project-setup/Parking_active.svg',
                  iconSize: [36, 36],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  tooltipAnchor: [16, -28],
                  shadowSize: [36, 36]
                }, _initHooksCalled: true }
            },
            info: info,
            value: v,
            editable: editable || false
          },
          geometry: {
            type: 'Point',
            coordinates: [v.latitude, v.longitude]
          }
        }
      ],
    };
  }

  /**
   * Level GeoJSON: Feature format - Polygon & Image
   * @param v
   * @param selectedParking
   * @param editable
   * @param active
   */
  private static levelServerOverlayGeoJSON(v: ParkLevel, selectedParking: Parking, editable: boolean, active: boolean) {
    // info for popup of icon level
    const info = {
      '<h5>Level</h5>ID': v.id,
        'Code': v.code,
        'Name': v.name,
        'Notes': v.notes,
    };
    const corners = this.parseConnectingPoints(v.connecting_points);
    return {
      type: 'Feature',
      properties: {
        options: {
          levelDraw: {
            imgUrl: v.img_url,
            corners: corners,
            editable: editable,
          },
        },
        value: v,
        editable: false,
        info: info,
      },
      geometry: {
        type: 'Point',
        coordinates: [selectedParking.latitude, selectedParking.longitude],
      }
    };
  }

  /**
   * Level GeoJSON: Feature format - Polygon & Image
   * @param imgUrl
   * @param selectedParking
   * @param editable
   * @param active
   */
  private static levelLocalOverlayGeoJSON(imgUrl: string, selectedParking: Parking, editable: boolean, active: boolean) {
    return {
      type: 'Feature',
      properties: {
        options: {
          levelDraw: {
            imgUrl: imgUrl,
            corners: [
                [+selectedParking.latitude + 0.01, +selectedParking.longitude + 0.005],
                [+selectedParking.latitude - 0.01, +selectedParking.longitude + 0.005],
                [+selectedParking.latitude + 0.01, +selectedParking.longitude - 0.005],
                [+selectedParking.latitude - 0.01, +selectedParking.longitude - 0.005],
              ],
            editable: editable,
          },
        },
        editable: false,
      },
      geometry: {
        type: 'Point',
        coordinates: [selectedParking.latitude, selectedParking.longitude],
      }
    };
  }

  /**
   * Carpark Zone GeoJSON: Feature format - Polygon
   * @param v
   * @param editable
   * @param active
   */
  private static parkZoneGeoJSON(v: ParkZone, editable: boolean, active: boolean) {
    // the info for the popup park zone
    const info = {
      '<h5>Park zone</h5>ID': v.id,
      'Name': v.name_en,
    };

    return {
      type: 'Feature',
      properties: {
        options: active
          ? { color: '#ff7800', fillOpacity: 0.5, weight : 3 }
          : { color: 'orange', fillOpacity: 0, weight : 3 },
        info: info,
        value: v,
        editable: editable || false
      },
      geometry: { type: 'Polygon', coordinates: [this.parseConnectingPoints(v.connecting_points)] }
    };
  }

  /**
   * Gate GeoJSON: Feature format - Point
   * @param v
   * @param editable
   * @param active
   */
  private static gateGeoJSON(v: Gate, editable: boolean, active: boolean) {
    // info for popup of icon gate
    const info = {
      '<h5>Gate</h5>ID': v.id,
      'Name': v.name_en,
      'Name (Ar)': v.name_ar,
    };
    const mapdataObj = {
      type: 'FeatureCollection',
      features: []
    };

    const centerPoint = {
      type: 'Feature',
      properties: {
        options: { icon: { options: {
              iconUrl: active
                ? '/assets/project-setup/Gate_selected.svg'
                : '/assets/project-setup/Gate_active.svg',
              iconRetinaUrl: active
                ? '/assets/project-setup/Gate_selected.svg'
                : '/assets/project-setup/Gate_active.svg',
              iconSize: [36, 36],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              tooltipAnchor: [16, -28],
              shadowSize: [36, 36]
            }, _initHooksCalled: true } },
        info: info,
        value: v,
        editable: editable || false
      },
      geometry: {
        type: 'Point',
        coordinates: [v.latitude, v.longitude]
      }
    };

    mapdataObj.features = [centerPoint];
    return mapdataObj;
  }

  /**
   * Lane GeoJSON: Feature format - Polygon, but line shape
   * @param v
   * @param editable
   * @param active
   */
  private static laneGeoJSON(v: Lane, editable: boolean, active: boolean) {
    // info for popup of icon lane
    const info = {
      '<h5>Lane</h5>ID': v.id,
      'Name': v.name_en,
      'Name (Ar)': v.name_ar,
    };

    const mapdataObj = {
      type: 'FeatureCollection',
      features: []
    };

    const polygon = {
      type: 'Feature',
      properties: {
        options: active
          ? { color: '#ff7800', fillOpacity: 0.5, weight : 3 }
          : { color: 'orange', fillOpacity: 0, weight : 3 },
        info: info,
        value: v,
        editable: editable || false
      },
      geometry: { type: 'Polygon', coordinates: [this.parseConnectingPoints(v.connecting_points)] }
    };

    mapdataObj.features = [polygon];
    return mapdataObj;
  }

  /**
   * ParkSpace GeoJSON: Feature format - Point
   * @param v
   * @param editable
   * @param active
   */
  private static parkSpaceGeoJSON(v: ParkSpace, editable: boolean, active: boolean) {
    // info for popup of icon ParkSpace
    const info = {
      '<h5>ParkSpace</h5>ID': v.id,
      'Code': v.code,
      'Name': v.name,
      'For Handicap': v.for_handicap,
      'Sensor': v.is_sensor,
    };

    const mapdataObj = {
      type: 'FeatureCollection',
      features: []
    };

    const centerPoint = {
      type: 'Feature',
      properties: {
        options: { icon: { options: {
              iconUrl: active
                ? '/assets/project-setup/Gate_selected.svg'
                : '/assets/project-setup/Gate_active.svg',
              iconRetinaUrl: active
                ? '/assets/project-setup/Gate_selected.svg'
                : '/assets/project-setup/Gate_active.svg',
              iconSize: [36, 36],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              tooltipAnchor: [16, -28],
              shadowSize: [36, 36]
            }, _initHooksCalled: true } },
        info: info,
        value: v,
        editable: editable || false
      },
      geometry: {
        type: 'Point',
        coordinates: [v.latitude, v.longitude]
      }
    };

    mapdataObj.features = [centerPoint];
    return mapdataObj;
  }

  /**
   * Asset GeoJSON: Feature format - Point
   * @param v
   * @param editable
   * @param active
   */
  private static assetGeoJSON(v: Assets, editable: boolean, active: boolean, assetType: CarparkAsset) {
    // info for popup of icon ParkSpace
    const typeName = '<h5>' + assetType.name + '</h5>ID';
    const info = {
      typeName : v.codification_id,
      'model': v.model,
    };

    const mapdataObj = {
      type: 'FeatureCollection',
      features: []
    };

    const centerPoint = {
      type: 'Feature',
      properties: {
        options: { icon: { options: {
              iconUrl: active
                ? assetType.selectedIcon
                : assetType.activeIcon,
              iconRetinaUrl: active
                ? assetType.selectedIcon
                : assetType.activeIcon,
              iconSize: [36, 36],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              tooltipAnchor: [16, -28],
              shadowSize: [36, 36]
            }, _initHooksCalled: true } },
        info: info,
        value: v,
        editable: editable || false
      },
      geometry: {
        type: 'Point',
        coordinates: [v.latitude, v.longitude]
      }
    };

    mapdataObj.features = [centerPoint];
    return mapdataObj;
  }

  /**
   * Assets GeoJSON: Feature format - Point TODO
   * @param v
   * @param editable
   * @param active
   */
  private static assetsGeoJSON(v: Asset, editable: boolean, active: boolean) {
    const icon = v.img_url
      ? v.img_url.startsWith('uploads')
        ? environment.apiBase + '/' + v.img_url
        : v.img_url
      : v.model_img_url || 'No Icon';

    // geoJSON Feature format - Point
    return {
      type: 'Feature',
      properties: {
        options: { icon: { options: {
          iconUrl: icon,
          iconRetinaUrl: icon,
          iconSize: [36, 36],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [36, 36]
        }, _initHooksCalled: true } },
        info: { // the info for the popup signage
          '<h5>Signage</h5>Codification ID': v.codification_id,
          'Zone ID': v.zone_code,
          'Project ID': v.project_id,
          'Signage code': v.model_code,
          'Signage name': v.model_txt,
          },
        value: v,
        editable: editable || false
      },
      geometry: {
        type: 'Point',
        coordinates: [v.latitude, v.longitude]
      }
    };
  }

  /**
   * Parse string to array of points
   * @param str [[21.502844,39.193705],[21.503247,39.194738],[21.502723,39.193641],[21.502844,39.193705], ...]
   */
  protected static parseConnectingPoints(str: string) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.warn(e, str);
      return [];
    }
  }

  protected constructor (
    protected dataService: CarparkDataService,
    protected terminalService: TerminalService,
    protected carparkService: CarparkService,
    protected carparkLevelService: CarparkLevelService,
    protected carparkZoneService: CarparkZoneService,
    protected gateService: GateService,
    protected laneService: LaneService,
    protected parkSpaceService: ParkSpaceService,
    protected carparkAssetsService: CarparkAssetsService,
    protected toastr: ToastrService,
  ) { }

  public rad(_) {
    return _ * Math.PI / 180;
  }

  public distanceBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {

    const dLat = this.rad(lat2 - lat1);
    const dLon = this.rad(lon2 - lon1);

    lat1 = this.rad(lat1);
    lat2 = this.rad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return RADIUS * c;
  }

  public ringArea(coords) {
    let p1, p2, p3, lowerIndex, middleIndex, upperIndex, i, area = 0;
    const coordsLength = coords.length;

    if (coordsLength > 2) {
        for (i = 0; i < coordsLength; i++) {
            if (i === coordsLength - 2) {// i = N-2
                lowerIndex = coordsLength - 2;
                middleIndex = coordsLength - 1;
                upperIndex = 0;
            } else if (i === coordsLength - 1) {// i = N-1
                lowerIndex = coordsLength - 1;
                middleIndex = 0;
                upperIndex = 1;
            } else { // i = 0 to N-3
                lowerIndex = i;
                middleIndex = i + 1;
                upperIndex = i + 2;
            }
            p1 = coords[lowerIndex];
            p2 = coords[middleIndex];
            p3 = coords[upperIndex];
            area += ( this.rad(p3[0]) - this.rad(p1[0]) ) * Math.sin( this.rad(p2[1]));
        }

        area = Math.abs(area * RADIUS * RADIUS / 2);
    }

    return area;
  }

  public distanceInArea(coords: any[]) {
    const coordsLength = coords.length;
    let distance = 0;
    if (coordsLength > 2) {
      for (let i = 0; i < coordsLength; i++) {
        if (i > 0) {
          distance += this.distanceBetweenEarthCoordinates(
            coords[i - 1][1], coords[i - 1][0],
            coords[i][1], coords[i][0]
          );
        }
      }
    }

    return distance;
  }

  public removeErrorsFromForm(form: FormGroup) {
    let control: AbstractControl = null;
    form.markAsUntouched();
    Object.keys(form.controls).forEach((name) => {
      control = form.controls[name];
      control.setErrors(null);
    });
  }

  public formValid(form: FormGroup, excludeNames: string[]) {
    // when removing errors with removeErrorsFromForm function, it neeeds to be validate each field correctly.
    Object.keys(form.controls).forEach((name) => {
      const control = form.controls[name];
      if (control.value !== 0 && control.value === undefined && control.value === null && !excludeNames.includes(name)) {
        control.setErrors({'required': true});
      }
    });

    return form.valid;
  }

  protected markerIcon(iconUrl) {
    return L.Icon.extend({
      options: {
        iconUrl: iconUrl,
        iconRetinaUrl: iconUrl,
        iconSize: [48, 48],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [48, 48]
      }
    });
  }

  /**
   * Move center, zoom-level according to seleceted Zone, Terminal, Carpark, Level, etc
   * Return this.mapCenter & this.mapZoomValue
   */
  protected moveMapCenterZoom() {
    if (this.selectedLane && this.selectedLane.connecting_points) {
      try {
        const coords = JSON.parse(this.selectedLane.connecting_points);
        if (coords && coords.length > 0) {
          this.mapCenter = coords[0];
        }
        this.mapZoomValue = MapZoom.ParkSpace;
      } catch (err) {
        console.warn(err);
      }

    } else if (this.selectedGate && this.selectedGate.latitude && this.selectedGate.longitude) {
      this.mapCenter = [this.selectedGate.latitude, this.selectedGate.longitude];
      this.mapZoomValue = MapZoom.ParkSpace;

    } else if (this.selectedParkSpace && this.selectedParkSpace.latitude && this.selectedParkSpace.longitude) {
      this.mapCenter = [this.selectedParkSpace.latitude, this.selectedParkSpace.longitude];
      this.mapZoomValue = MapZoom.ParkSpace;

    } else if (this.selectedParkZone && this.selectedParkZone.connecting_points) {
      try {
        const coords = JSON.parse(this.selectedParkZone.connecting_points);
        if (coords && coords.length > 0) {
          this.mapCenter = coords[0];
        } else {
          // TODO: this line should be fixed
          this.mapCenter = [21.484396, 39.242693];
        }
        this.mapZoomValue = MapZoom.CarparkZone;
      } catch (err) {
        console.warn(err);
      }

    } else if (this.selectedParkLevel && this.selectedParking && this.selectedParking.latitude && this.selectedParking.longitude) {
      this.mapCenter = [this.selectedParking.latitude, this.selectedParking.longitude];
      this.mapZoomValue = MapZoom.Carpark;

    } else if (this.selectedParking && this.selectedParking.latitude && this.selectedParking.longitude) {
      this.mapCenter = [this.selectedParking.latitude, this.selectedParking.longitude];
      this.mapZoomValue = MapZoom.Carpark;

    } else if (this.selectedTerminal && this.selectedTerminal.latitude && this.selectedTerminal.longitude) {
      this.mapCenter = [this.selectedTerminal.latitude, this.selectedTerminal.longitude];
      this.mapZoomValue = MapZoom.ProjectZone;

    } else if (this.selectedZone && this.selectedZone.connecting_points) {
      try {
        const coords = JSON.parse(this.selectedZone.connecting_points);
        if (coords && coords.length > 0) {
          this.mapCenter = coords[0];
        }
        this.mapZoomValue = MapZoom.ProjectZone;
      } catch (err) {
        console.warn(err);
      }

    } else {
      this.mapCenter = this.projectCenter;
      this.mapZoomValue = MapZoom.Project;
    }

    return {
      mapCenter: this.mapCenter,
      mapZoomValue: this.mapZoomValue,
    };
  }

  /**
   * Draw detail map in tabs - Zone, Terminal, Parking ...
   * @param currentLevel
   * @param editables
   * @param showOptions
   *  {
   *    zone?: boolean, terminal?: boolean, level?: boolean, parking?: boolean,
   *    parkZone?: boolean, gates?: boolean, lanes?: boolean, parkSpaces?: boolean,
   *   },
   */
  protected loadMapData(currentLevel: CarparkItemLevel, editables: any, showOptions: string[]) {
    const filter = this.filter ? this.filter.trim().toLowerCase() : '';
    const { mapDataJSON, mapDrawDataJSON, mapImgOverlayJSON } = this._loadMapData(false, currentLevel, editables, ({zones, terminals, parkings, parkLevels, parkZones, parkSpaces, gates, lanes, assets}) => {
      if (editables.zone) {
        zones = showOptions.includes('Zone')
          ? zones.filter( v => v.zone_name.toLocaleLowerCase().indexOf(filter) >= 0)
          : [];
      }
      if (editables.terminal) {
        terminals = showOptions.includes('Terminal')
          ? terminals.filter( v => v.terminal_name.toLocaleLowerCase().indexOf(filter) >= 0)
          : [];
      }
      if (editables.parkLevel) {
        parkLevels = showOptions.includes('Level')
          ? parkLevels.filter((v: ParkLevel) => v.name.toLocaleLowerCase().indexOf(filter) >= 0)
          : [];
      }
      if (editables.parking) {
        parkings = showOptions.includes('Parking')
          ? parkings.filter((v: Parking) => v.carpark_name.toLocaleLowerCase().indexOf(filter) >= 0)
          : [];
      }
      if (editables.parkZone) {
        parkZones = showOptions.includes('Park Zone')
          ? parkZones.filter((v: ParkZone) => v.name_en.toLocaleLowerCase().indexOf(filter) >= 0)
          : [];
      }
      if (editables.gate) {
        gates = showOptions.includes('Gate')
          ? gates.filter( v => v.name_en.toLocaleLowerCase().indexOf(filter) >= 0)
          : [];
      }
      if (editables.lane) {
        lanes = showOptions.includes('Lane')
          ? lanes.filter( v => v.name_en.toLocaleLowerCase().indexOf(filter) >= 0)
          : [];
      }
      if (editables.parkSpace) {
        parkSpaces = showOptions.includes('Park Space')
          ? parkSpaces.filter( v => v.name.toLocaleLowerCase().indexOf(filter) >= 0)
          : [];
      }
      if (editables.assets) {
        assets = showOptions.includes('Asset')
          ? assets.filter( v => v.codification_id.toLocaleLowerCase().indexOf(filter) >= 0)
          : [];
      }
      return {zones, terminals, parkings, parkLevels, parkZones, parkSpaces, gates, lanes, assets};
    });
    this.tabMapDataJSON = mapDataJSON;
    this.tabMapDrawDataJSON = mapDrawDataJSON;
    this.tabMapImgOverlayDataJSON = mapImgOverlayJSON;
  }

  /**
   * Draw overview map in the first carpark-setup page
   * @param isOverViewMap
   * @param currentLevel
   * @param editables
   * @param callback
   * @private
   */
  protected _loadMapData(isOverViewMap: boolean, currentLevel: CarparkItemLevel, editables: any, callback: (data: any) => any) {
    const mapDataObj = {
      features: []
    };
    const mapDrawDataObj = {
      features: []
    };
    const mapImgOverlayDataObj = {
      features: []
    };

    const clusterMapDataObj: any = {
      zones: { features: [] },
      terminals: { features: [] },
      parkings: { features: [] },
      parkLevels: { features: [] },
      parkZones: { features: [] },
      parkSpaces: { features: [] },
      gates: { features: [] },
      lanes: { features: [] },
      assets: { features: [] },
    };

    let zones = this.allZones || [];
    let terminals = (isOverViewMap ? this.allTerminals : this.terminals) || [];
    let parkings = (isOverViewMap ? this.allParkings : this.parkings) || [];
    let parkLevels = (isOverViewMap ? this.allParkLevels : this.parkLevels) || [];
    let parkZones = (isOverViewMap ? this.allParkZones : this.parkZones) || [];
    let parkSpaces = (isOverViewMap ? this.allParkSpaces : this.parkSpaces) || [];
    let gates = (isOverViewMap ? this.allGates : this.gates) || [];
    let lanes = (isOverViewMap ? this.allLanes : this.lanes) || [];
    let assets = (isOverViewMap ? this.allAssets : this.assets) || [];

    if (callback) {
      const result = callback({zones, terminals, parkings, parkLevels, parkZones, parkSpaces, gates, lanes, assets});
      zones = result.zones;
      terminals = result.terminals;
      parkings = result.parkings;
      parkLevels = result.parkLevels;
      parkZones = result.parkZones;
      parkSpaces = result.parkSpaces;
      gates = result.gates;
      lanes = result.lanes;
      assets = result.assets;
      // TODO: tslint issue
      // { zones, terminals, parkings, parkLevels, parkZones, parkSpaces, gates, lanes, assets } = result;
    }

    // Display zones - Polygon
    zones
      .map( zone => {
        const polygon = BaseCarparkComponent.projectZoneGeoJSON(zone, editables.zone, zone === this.selectedZone);
        if (currentLevel === CarparkItemLevel.Zone) {
          mapDataObj.features.push(polygon);
          clusterMapDataObj.zones.features.push(polygon);
          if (zone === this.selectedZone && editables.zone) {
            mapDrawDataObj.features.push(polygon);
          }
        } else if (isOverViewMap || (currentLevel >= CarparkItemLevel.Zone && zone === this.selectedZone)) {
          mapDataObj.features.push(polygon);
          clusterMapDataObj.zones.features.push(polygon);
        }
      });

    // Polygon & Point
    terminals
      .map(terminal => {
        const marker = BaseCarparkComponent.terminalGeoJSON(terminal, editables.terminal, terminal === this.selectedTerminal);
        if (currentLevel === CarparkItemLevel.Terminal) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.terminals.features.push(marker);
          if (terminal === this.selectedTerminal && editables.terminal) {
            mapDrawDataObj.features.push(marker);
          }
        } else if (isOverViewMap || (currentLevel >= CarparkItemLevel.Terminal && terminal === this.selectedTerminal)) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.terminals.features.push(marker);
        }
      });

    // Polygon & Point
    parkings
      .map(parking => {
        const marker = BaseCarparkComponent.parkingGeoJSON(parking, editables.parking, parking === this.selectedParking);
        if (currentLevel === CarparkItemLevel.Parking) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.parkings.features.push(marker);
          if (parking === this.selectedParking && editables.parking) {
            mapDrawDataObj.features.push(marker);
          }
        } else if (isOverViewMap || (currentLevel >= CarparkItemLevel.Parking && parking === this.selectedParking)) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.parkings.features.push(marker);
        }
      });

    // Polygon & Image
    parkLevels
      .map(level => {
        if (this.selectedParking) {
          if (level === this.selectedParkLevel) {
            const planDraw = this.loadRemoteImgOverlay(level, editables.parkLevel);
            if (planDraw) {
              mapImgOverlayDataObj.features.push(planDraw);
            }
          }
        }
      });

    // Polygon
    parkZones
      .map(zone => {
        const marker = BaseCarparkComponent.parkZoneGeoJSON(zone, editables.parkZone, zone === this.selectedParkZone);
        if (currentLevel === CarparkItemLevel.ParkZone) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.parkZones.features.push(marker);
          if (zone === this.selectedParkZone && editables.parkZone) {
            mapDrawDataObj.features.push(marker);
          }
        } else if (isOverViewMap || (currentLevel >= CarparkItemLevel.ParkZone && zone === this.selectedParkZone)) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.parkZones.features.push(marker);
        }
      });

    // Point
    gates
      .map(gate => {
        const marker = BaseCarparkComponent.gateGeoJSON(gate, editables.gate, gate === this.selectedGate);
        if (currentLevel === CarparkItemLevel.Gate) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.gates.features.push(marker);
          if (gate === this.selectedGate && editables.gate) {
            mapDrawDataObj.features.push(marker);
          }
        } else if (isOverViewMap || (currentLevel >= CarparkItemLevel.Gate && gate === this.selectedGate)) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.gates.features.push(marker);
        }
      });

    // Point
    lanes
      .map(lane => {
        const marker = BaseCarparkComponent.laneGeoJSON(lane, editables.lane, lane === this.selectedLane);
        if (currentLevel === CarparkItemLevel.Lane) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.lanes.features.push(marker);
          if (lane === this.selectedLane && editables.lane) {
            mapDrawDataObj.features.push(marker);
          }
        } else if (isOverViewMap || (currentLevel >= CarparkItemLevel.Lane && lane === this.selectedLane)) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.lanes.features.push(marker);
        }
      });

    // Polygon & Point
    parkSpaces
      .map(parkSpace => {
        const marker = BaseCarparkComponent.parkSpaceGeoJSON(parkSpace, editables.parkSpace, parkSpace === this.selectedParkSpace);
        if (currentLevel === CarparkItemLevel.ParkSpace) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.parkSpaces.features.push(marker);
          if (parkSpace === this.selectedParkSpace && editables.parkSpace) {
            mapDrawDataObj.features.push(marker);
          }
        } else if (isOverViewMap || (currentLevel >= CarparkItemLevel.ParkSpace && parkSpace === this.selectedParkSpace)) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.parkSpaces.features.push(marker);
        }
      });

    // Point
    assets
      .map(asset => {
        const marker = BaseCarparkComponent.assetGeoJSON(asset, editables.asset, asset === this.selectedAsset, this.selectedAssetType);
        if (currentLevel === CarparkItemLevel.Asset) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.assets.features.push(marker);
          if (asset === this.selectedAsset && editables.asset) {
            mapDrawDataObj.features.push(marker);
          }
        } else if (isOverViewMap || (currentLevel >= CarparkItemLevel.Asset && asset === this.selectedAsset)) {
          mapDataObj.features.push(marker);
          clusterMapDataObj.assets.features.push(marker);
        }
      });

    return {
      mapDataJSON: JSON.stringify(mapDataObj),
      mapDrawDataJSON: JSON.stringify(mapDrawDataObj),
      mapImgOverlayJSON: JSON.stringify(mapImgOverlayDataObj),
      clusterMapDataObj: JSON.stringify(clusterMapDataObj),
    };
  }

  protected loadRemoteImgOverlay(level: ParkLevel, editable: boolean) {
    if (this.selectedParking) {
      return BaseCarparkComponent.levelServerOverlayGeoJSON(level, this.selectedParking, editable, true);
    }
    return null;
  }

  protected drawLocalImgOverlay(localImgUrl: string, editable: boolean) {
    const imgOverlayDataObj = {
      features: []
    };

    // Polygon & Image
    if (this.selectedParking) {
      const polygon = BaseCarparkComponent.levelLocalOverlayGeoJSON(localImgUrl, this.selectedParking, editable, true);
      imgOverlayDataObj.features.push(polygon);
    }

    this.tabMapImgOverlayDataJSON = JSON.stringify(imgOverlayDataObj);
  }

  protected APIErrorHandler(err: any, message: string) {
    console.error(err);
    this.toastr.error(message, 'Error!');
  }
}

