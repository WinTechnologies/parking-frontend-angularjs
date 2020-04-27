import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {forkJoin} from 'rxjs';

import {CarparkDataService} from '../services/carpark-data.service';
import {PgAssetService} from '../../../../components/assets/services/assets.service';
import {PgProjectsService} from '../../../../components/projects/services/projects.service';
import {PgProjectZoneService} from '../../common-setup/services/onstreet/project-zone.service';
import {TerminalService} from '../services/terminal.service';
import {CarparkService} from '../services/carpark.service';
import {CarparkLevelService} from '../services/carpark-level.service';
import {CarparkZoneService} from '../services/carpark-zone.service';
import {GateService} from '../services/gate.service';
import {LaneService} from '../services/lane.service';
import {ParkSpaceService} from '../services/park-space.service';
import {CarparkAssetsService} from '../services/carpark-assets.service';
import {ToastrService} from 'ngx-toastr';
import MapOptions from '../../../../shared/classes/MapOptions';

import {BaseCarparkComponent} from './base-carpark/base-carpark.component';

import {CarparkAsset, CarparkAssets, CarparkItem, CarparkItemLevel, CarparkItems, CarparkItemType, FormMode, ViewMode} from '../models/carpark.model';
import {Project} from '../../../../components/projects/models/project.model';
import {ProjectZone} from '../../common-setup/models/onstreet/project_zone.model';
import {Assets, Gate, Lane, Parking, ParkLevel, ParkSpace, ParkZone, Terminal} from '../models/carpark-items.model';
import {Asset} from '../../../../components/assets/models/asset.model';


@Component({
  selector: 'app-carpark-setup',
  templateUrl: './carpark-setup.component.html',
  styleUrls: ['./carpark-setup.component.scss']
})
export class CarparkSetupComponent extends BaseCarparkComponent implements OnInit, OnDestroy {

  @ViewChild('child')
  public child: BaseCarparkComponent;

  public viewMode = ViewMode.MapView;
  public formMode = FormMode.SELECTING;

  CarparkItemType = CarparkItemType;
  types = CarparkItems;
  selectedType: CarparkItem;
  assetTypes: CarparkAsset[];

  project: Project;
  projectId: number;

  public overviewMapDataJSON = '';
  public overviewMapDrawDataJSON = '';
  mapOptions = new MapOptions(true, false, false, false, false, {lat: 48.864716, lng: 2.349014});

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
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    public matIconRegistry: MatIconRegistry,
    private readonly location: Location,
    private readonly projectService: PgProjectsService,
    private readonly projectZoneService: PgProjectZoneService,
    private readonly assetService: PgAssetService,
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
    this.matIconRegistry.addSvgIcon('maps', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/enforcementsetup/map_view_icon.svg'));
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.projectId = params['id'];
        this.projectService.getProjectById(this.projectId)
          .takeUntil(this.destroy$)
          .subscribe(res => {
            if (res) {
              this.project = res;
              this.projectCenter = [this.project.center_latitude, this.project.center_longitude];
            }
          });
      }
    });
  }

  ngOnInit() {
    this.getAllItems();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public onBack() {
    // Unselected ProjectZone before exit Carpark Setup module
    this.selectedZone = new ProjectZone();
    this.location.back();
  }

  public applyFilterAssets(filter: string) {
    this.filter = filter;
    this.loadOverviewMapData(this.filter);
  }

  private async getAllItems() {
    forkJoin(
      this.projectZoneService.getWithProject({project_id: this.projectId}),
      this.carparkService.getAllByProject(this.projectId),
      this.carparkLevelService.getAllByProject(this.projectId),
    )
      .takeUntil(this.destroy$)
      .subscribe(res => {
        const [zone, parking, levels] = res;
        this.allZones = zone;
        this.allParkings = parking;
        this.allParkLevels = levels;
        this.loadOverviewMapData(this.filter);
      });
    this.assetTypes = CarparkAssets;
    this.selectedAssetType = this.assetTypes[0];
    const [terminals, parkZones, gates, lanes, parkSpaces, assets] = await Promise.all([
      this.terminalService.getAllByProject(this.projectId),
      this.carparkZoneService.getAllByProject(this.projectId),
      this.gateService.getAllByProject(this.projectId),
      this.laneService.getAllByProject(this.projectId),
      this.parkSpaceService.getAllByProject(this.projectId),
      this.carparkAssetsService.getAllByProject(this.projectId, this.selectedAssetType.code),
    ]);
    this.allTerminals = terminals;
    this.allParkZones = parkZones;
    this.allGates = gates;
    this.allLanes = lanes;
    this.allParkSpaces = parkSpaces;
    this.allAssets = assets;
    this.loadOverviewMapData(this.filter);
  }

  private loadOverviewMapData(filter: string = '') {
    filter = filter.trim().toLowerCase();
    const { mapDataJSON, mapDrawDataJSON } = this._loadMapData(true, CarparkItemLevel.MAX, {}, (data: any) => {
      let {zones, terminals, parkings, parkLevels, parkZones, parkSpaces, gates, lanes, assets} = data;

      zones = this.selectedOptions.includes('Zone')
        ? zones.filter((v: ProjectZone) => v.zone_name.toLocaleLowerCase().indexOf(filter) >= 0)
        : [];

      terminals = this.selectedOptions.includes('Terminal')
        ? terminals.filter((v: Terminal) => v.terminal_name.toLocaleLowerCase().indexOf(filter) >= 0)
        : [];

      parkings = this.selectedOptions.includes('Parking')
        ? parkings.filter((v: Parking) => v.carpark_name.toLocaleLowerCase().indexOf(filter) >= 0)
        : [];

      parkLevels = this.selectedOptions.includes('Level')
        ? parkLevels.filter((v: ParkLevel) => v.name.toLocaleLowerCase().indexOf(filter) >= 0)
        : [];

      parkZones = this.selectedOptions.includes('Park Zone')
        ? parkZones.filter((v: ParkZone) => v.name_en.toLocaleLowerCase().indexOf(filter) >= 0)
        : [];

      parkSpaces = this.selectedOptions.includes('Park Space')
        ? parkSpaces.filter((v: ParkSpace) => v.name.toLocaleLowerCase().indexOf(filter) >= 0)
        : [];

      gates = this.selectedOptions.includes('Gate')
        ? gates.filter((v: Gate) => v.name_en.toLocaleLowerCase().indexOf(filter) >= 0)
        : [];

      lanes = this.selectedOptions.includes('Lane')
        ? lanes.filter((v: Lane) => v.name_en.toLocaleLowerCase().indexOf(filter) >= 0)
        : [];

      assets = this.selectedOptions.includes('Asset')
        ? assets.filter((v: Assets) => v.codification_id.toLocaleLowerCase().indexOf(filter) >= 0)
        : [];

      return {zones, terminals, parkings, parkLevels, parkZones, parkSpaces, gates, lanes, assets};
    });
    this.overviewMapDataJSON = mapDataJSON;
    this.overviewMapDrawDataJSON = mapDrawDataJSON;
  }

  public onShowItemsSelection(e: any, selectionListRef: any) {
    this.viewMode = ViewMode.MapView;

    if (e.option.value === 'All') {
      if (e.option.selected) {
        selectionListRef.selectAll();
      } else {
        selectionListRef.deselectAll();
      }
    } else {
      if (!e.option.selected) {
        if (this.selectedOptions.length &&
          this.selectedOptions.includes('All')) {
          this.selectedOptions = this.selectedOptions.slice(1);
        }
      }
    }

    this.loadOverviewMapData(this.filter);
  }

  public onAdd(selectedOptions?) {
    this.viewMode = ViewMode.MapView;
    this.formMode = FormMode.CREATING;
    //  this.child.onAdd();
    // if (selectedOptions) {
    //   this.onSelectType(CarparkItems.filter((item: CarparkItem) => item.type === +CarparkItemType[selectedOptions[0].replace(/\s/g, '')])[0]);
    // }
  }

  /** change display mode */
  public onChangeDisplayMode(selectedOptions): void {
    this.formMode = FormMode.SELECTING;
    const carparkItemType: CarparkItem = CarparkItems.find((item: CarparkItem) => item.type === CarparkItemType[selectedOptions[0].replace(/\s/g, '')]);
    if (this.viewMode === ViewMode.ListView) {
      this.viewMode = ViewMode.MapView;
      this.onSelectType(carparkItemType); // this.onSelectType()
      this.selectedOptions = [carparkItemType.name];
    } else {
      this.viewMode = ViewMode.ListView;
      this.onSelectType(carparkItemType);
    }
  }

  public onSelectType(type?: CarparkItem) {
    // if (
    //   (!this.selectedType && type.name !== 'Zone')
    //   || (this.selectedType && this.formMode === FormMode.UPDATING && type.level > (this.selectedType.level + 1))
    //   || (this.selectedType && this.formMode !== FormMode.UPDATING && type.level > this.selectedType.level)
    // ) {
    //   return;
    // }

    if (type) {
      this.selectedType = type;
      switch (this.selectedType.type) {
        case CarparkItemType.Zone:
          this.formMode = this.selectedZone && this.selectedZone.id ? FormMode.UPDATING : FormMode.SELECTING;
          break;

        case CarparkItemType.Terminal:
          this.formMode = this.selectedTerminal && this.selectedTerminal.id ? FormMode.UPDATING : FormMode.SELECTING;
          break;

        case CarparkItemType.Parking:
          this.formMode = this.selectedParking && this.selectedParking.id ? FormMode.UPDATING : FormMode.SELECTING;
          break;

        case CarparkItemType.Level:
          this.formMode = this.selectedParkLevel && this.selectedParkLevel.id ? FormMode.UPDATING : FormMode.SELECTING;
          break;

        case CarparkItemType.ParkZone:
          this.formMode = this.selectedParkZone && this.selectedParkZone.id ? FormMode.UPDATING : FormMode.SELECTING;
          break;

        case CarparkItemType.ParkSpace:
          this.formMode = this.selectedParkSpace && this.selectedParkSpace.id ? FormMode.UPDATING : FormMode.SELECTING;
          break;

        case CarparkItemType.Gate:
          this.formMode = this.selectedGate && this.selectedGate.id ? FormMode.UPDATING : FormMode.SELECTING;
          break;

        case CarparkItemType.Lane:
          this.formMode = this.selectedLane && this.selectedLane.id ? FormMode.UPDATING : FormMode.SELECTING;
          break;

        case CarparkItemType.Asset:
          this.formMode = this.selectedAsset && this.selectedAsset.codification_id ? FormMode.UPDATING : FormMode.SELECTING;
          break;
      }

      this.selectedOptions = [type.name];
      window.scrollTo(0, 0);
    }
  }

  public determineTypeImage(type: CarparkItem, selectedType: CarparkItem) {
    if (selectedType) {
      if (type === selectedType) {
        return type.selectedIcon;
      } else if (this.formMode === FormMode.UPDATING) {
        // return type.level <= (selectedType.level + 1) ? type.activeIcon : type.inactiveIcon;
        return type.activeIcon;
      } else {
        // return type.level <= selectedType.level ? type.activeIcon : type.inactiveIcon;
        return type.activeIcon;
      }
    } else {
      // return type.level === 0 ? type.activeIcon : type.inactiveIcon;
      return type.activeIcon;
    }
  }

  public determineTypeStyle(type: CarparkItem, selectedType: CarparkItem) {
    const commonStyle = { 'carpark-setup-page-content-header-type-item': true };
    if (selectedType) {
      if (type === selectedType) {
        return { ...commonStyle, selected: true };

      } else if (this.formMode === FormMode.UPDATING) {
        // return type.level <= (selectedType.level + 1)
        //   ? { ...commonStyle, active: true }
        //   : { ...commonStyle, inactive: true };
        return { ...commonStyle, active: true };

      } else {
        // return type.level <= selectedType.level
        //   ? { ...commonStyle, active: true }
        //   : { ...commonStyle, inactive: true };
        return { ...commonStyle, active: true };

      }

    } else {
      // return type.level === 0
      //   ? { ...commonStyle, active: true }
      //   : commonStyle;
      return { ...commonStyle, active: true };

    }
  }
}
