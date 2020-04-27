import {Injectable} from '@angular/core';
import {ProjectZone} from '../../common-setup/models/onstreet/project_zone.model';
import {Assets, Gate, Lane, Parking, ParkLevel, ParkSpace, ParkZone, Terminal} from '../models/carpark-items.model';
import {CarparkAsset} from '../models/carpark.model';

@Injectable()
export class CarparkDataService {

  public projectCenter: any;

  public allZones: ProjectZone[];
  private selectedZone: ProjectZone;

  public allTerminals: Terminal[];
  public terminals: Terminal[];
  private selectedTerminal: Terminal;

  public allParkings: Parking[];
  public parkings: Parking[];
  private selectedParking: Parking;

  public allParkLevels: ParkLevel[];
  public parkLevels: ParkLevel[];
  private selectedParkLevel: ParkLevel;

  public allParkZones: ParkZone[];
  public parkZones: ParkZone[];
  private selectedParkZone: ParkZone;

  public allParkSpaces: ParkSpace[];
  public parkSpaces: ParkSpace[];
  private selectedParkSpace: ParkSpace;

  public allGates: Gate[];
  public gates: Gate[];
  private selectedGate: Gate;

  public allLanes: Lane[];
  public lanes: Lane[];
  private selectedLane: Lane;

  public allAssets: Assets[];
  public assets: Assets[];
  private selectedAsset: Assets;
  private selectedAssetType: CarparkAsset;

  constructor() { }

  selectProjectZone(zone: ProjectZone) {
    this.selectedZone = zone;
  }

  getProjectZone(): ProjectZone {
    return this.selectedZone;
  }

  selectTerminal(terminal: Terminal) {
    this.selectedTerminal = terminal;
  }

  getTerminal(): Terminal {
    return this.selectedTerminal;
  }

  selectParking(parking: Parking) {
    this.selectedParking = parking;
  }

  getParking(): Parking {
    return this.selectedParking;
  }

  selectParkZone(parkZone: ParkZone) {
    this.selectedParkZone = parkZone;
  }

  getParkZone(): ParkZone {
    return this.selectedParkZone;
  }

  selectParkLevel(level: ParkLevel) {
    this.selectedParkLevel = level;
  }

  getParkLevel(): ParkLevel {
    return this.selectedParkLevel;
  }

  selectParkSpace(space: ParkSpace) {
    this.selectedParkSpace = space;
  }

  getParkSpace(): ParkSpace {
    return this.selectedParkSpace;
  }

  selectGate(gate: Gate) {
    this.selectedGate = gate;
  }

  getGate(): Gate {
    return this.selectedGate;
  }

  selectLane(lane: Lane) {
    this.selectedLane = lane;
  }

  getLane(): Lane {
    return this.selectedLane;
  }

  selectAsset(asset: Assets) {
    this.selectedAsset = asset;
  }

  getAsset(): Assets {
    return this.selectedAsset;
  }

  selectAssetType(type: CarparkAsset) {
    this.selectedAssetType = type;
  }

  getAssetType(): CarparkAsset {
    return this.selectedAssetType;
  }
}
