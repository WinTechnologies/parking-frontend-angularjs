import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BaseCarparkComponent} from '../base-carpark/base-carpark.component';
import {FormMode, ViewMode, CarparkAsset, CarparkAssets, CarparkItemType, CarparkItemLevel} from '../../models/carpark.model';
import {Assets, EmptyParking, EmptyParkLevel, EmptyParkZone, EmptyTerminal, Parking, ParkLevel, ParkZone, Terminal} from '../../models/carpark-items.model';
import {EmptyPrZone, ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import MapOptions from '../../../../../shared/classes/MapOptions';

import {CarparkDataService} from '../../services/carpark-data.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkService} from '../../services/carpark.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {LaneService} from '../../services/lane.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {GateService} from '../../services/gate.service';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import {CarparkAssetsService} from '../../services/carpark-assets.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-carpark-asset',
  templateUrl: './carpark-asset.component.html',
  styleUrls: ['./carpark-asset.component.scss']
})
export class CarparkAssetComponent extends BaseCarparkComponent implements OnInit, OnDestroy, OnChanges {
  ViewMode = ViewMode;
  FormMode = FormMode;
  CarparkItemType = CarparkItemType;

  @Input() projectId: number;
  @Input() viewMode: ViewMode;
  @Input() formMode: FormMode;
  @Input() showOptions: string[];
  @Output() changeFormMode = new EventEmitter<FormMode>();

  availableAssets: Assets[];
  assetTypes: CarparkAsset[];
  form: FormGroup;

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
    private readonly formBuilder: FormBuilder,
    private readonly assetService: PgAssetService,
    private readonly router: Router
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
  }

  async ngOnInit() {
    this.resetMapOptions();
    this.assetTypes = CarparkAssets;

    [this.availableAssets] = await Promise.all([
      this.carparkAssetsService.getAll(this.selectedAssetType.code)]);

    if (this.selectedAsset && this.selectedAsset.codification_id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);
    }

    this.buildForm();
    this.loadMapData(CarparkItemLevel.Asset, { asset: true }, this.showOptions);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.filter || changes.showOptions) {
      this.loadMapData(CarparkItemLevel.Asset, { asset: true }, this.showOptions);
    }
    if (changes.formMode && this.formMode === FormMode.CREATING) {
      this.resetForm();
    }
  }

  public onAvailableAssetSelection(codification_id) {
    const asset = this.availableAssets.find(v => v.codification_id === codification_id);
    this.form.controls['model'].setValue(asset.model);
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      project_id: [this.projectId, [Validators.required]],
      zone_id: [this.selectedZone ? this.selectedZone.id : null, [Validators.required]],
      carpark_id: [this.selectedParking ? this.selectedParking.id : null, [Validators.required]],
      carpark_zone_id: [this.selectedParkZone ? this.selectedParkZone.id : null, [Validators.required]],
      codification_id: [this.selectedAsset ? this.selectedAsset.codification_id : '', [Validators.required]],
      model: [this.selectedAsset && this.selectedAsset.model ? this.selectedAsset.model : ''],
      latitude: [this.selectedAsset ? this.selectedAsset.latitude : '', [Validators.required]],
      longitude: [this.selectedAsset ? this.selectedAsset.longitude : '', [Validators.required]],
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
      this.form.controls['latitude'].setValue(points[0]);
      this.form.controls['longitude'].setValue(points[1]);
    } else {
      this.form.controls['latitude'].setValue(0);
      this.form.controls['longitude'].setValue(0);
    }
  }

  async onSubmit() {
    const asset = this.form.value as Assets;
    if (this.formValid(this.form, [])) {
      if (this.formMode === FormMode.UPDATING) {
        asset.codification_id = this.selectedAsset.codification_id;
        await this.carparkAssetsService.update(asset);
        this.toastr.success('The asset is updated successfully!', 'Success!');
        this.assets = this.assets
          .filter(t => t.codification_id !== asset.codification_id)
          .concat([asset as Assets]);
        this.allAssets = this.allAssets
          .filter(t => t.codification_id !== asset.codification_id)
          .concat([asset as Assets]);
        this.resetForm(FormMode.JUST_UPDATED);
      } else if (this.formMode === FormMode.CREATING) {
        const res = await this.carparkAssetsService.create(asset);
        asset.codification_id = res.id;
        this.assets.push(asset);
        this.allAssets.push(asset);
        this.toastr.success('A asset is installed successfully!', 'Success!');
        this.resetForm(FormMode.JUST_CREATED);
      }
      this.resetMapOptions();
    }
  }

  public returnToSelection() {
    this.formMode = FormMode.SELECTING;
    this.changeFormMode.emit(this.formMode);
  }


  public onZoneSelection(zone: ProjectZone) {
    this.selectedZone = zone === EmptyPrZone
      ? EmptyPrZone // All Zones
      : this.allZones.find(v => v.id === zone.id);

    if (this.selectedZone && this.selectedZone.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Asset, { asset: true }, this.showOptions);
    }
  }

  public onTerminalSelection(terminal: Terminal) {
    this.selectedTerminal = terminal === EmptyTerminal
      ? EmptyTerminal // Al Terminals
      : this.terminals.find(v => v.id === terminal.id);

    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Asset, { asset: true }, this.showOptions);
    }
  }

  public onParkingSelection(parking: Parking) {
    this.selectedParking = parking === EmptyParking
      ? EmptyParking // All parkings
      : this.parkings.find(v => v.id === parking.id);

    if (this.selectedParking && this.selectedParking.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Asset, { asset: true }, this.showOptions);
    }
  }

  public onLevelSelection(level: ParkLevel) {
    this.selectedParkLevel = level === EmptyParkLevel
      ? EmptyParkLevel // All parkLevels
      : this.parkLevels.find(v => v.id === level.id);

    if (this.selectedParkLevel && this.selectedParkLevel.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Asset, { asset: true }, this.showOptions);
    }
  }

  public onParkZoneSelection(zone: ParkZone) {
    this.selectedParkZone = zone === EmptyParkZone
      ? EmptyParkZone // All parkzones
      : this.parkZones.find(v => v.id === zone.id);

    if (this.selectedParkZone && this.selectedParkZone.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Asset, { asset: true }, this.showOptions);
    }
  }

  public onAssetSelection(asset: Assets) {
    this.selectedAsset = this.assets.find(v => v.codification_id === asset.codification_id);
    if (this.selectedAsset && this.selectedAsset.codification_id) {
      this.fillUpdateForm();
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Asset, { asset: true }, this.showOptions);
    }
  }

  async onAssetTypeSelection(type: CarparkAsset) {
    this.selectedAssetType = this.assetTypes.find(v => v.code === type.code);
    [this.availableAssets, this.assets] = await Promise.all([
      this.carparkAssetsService.getAll(this.selectedAssetType.code),
      this.carparkAssetsService.getByParkZone(this.selectedParkZone.id, this.selectedAssetType.code)]);
    this.allAssets = this.assets;
    this.resetForm();
    this.resetMapOptions();
  }

  public onCancel() {
    this.resetForm(FormMode.SELECTING);
    this.resetMapOptions();
  }

  /**
   * list view component event handler
   * @param filter
   */
  public onUpdateMapData(filter: string): void {
    // TODO: filter
    this.loadMapData(CarparkItemLevel.Asset, { asset: true }, this.showOptions);
  }

  private fillUpdateForm() {
    if (this.selectedAsset && this.selectedAsset.codification_id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);

      this.form.reset({
        project_id: this.projectId,
        zone_id: this.selectedZone.id,
        carpark_id: this.selectedParking.id,
        carpark_zone_id: this.selectedParkZone.id,
        codification_id: this.selectedAsset.codification_id,
        model: this.selectedAsset.model,
        latitude: this.selectedAsset.latitude,
        longitude: this.selectedAsset.longitude,
      });
    }
  }

  private resetForm(nextFormMode: FormMode = null) {
    if (nextFormMode !== null) {
      this.formMode = nextFormMode;
      this.changeFormMode.emit(this.formMode);
    }

    this.selectedAsset = new Assets();

    this.form.reset({
      project_id: this.projectId,
      zone_id: this.selectedZone.id,
      carpark_id: this.selectedParking.id,
      carpark_zone_id: this.selectedParkZone.id,
      codification_id: '',
      model: '',
      latitude: '',
      longitude: '',
    });
    this.removeErrorsFromForm(this.form);
    this.tabMapDrawDataJSON = '';
  }

  async onDeleteCurrentAsset(event, asset: Assets) {
    event.stopPropagation();
    try {
      if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
        await this.carparkAssetsService.delete(asset.codification_id);
        this.toastr.success('The asset has been removed successfully!', 'Success!');
        this.assets = this.assets
          .filter(t => t.codification_id !== asset.codification_id);
        this.allAssets = this.allAssets
          .filter(t => t.codification_id !== asset.codification_id);
        this.resetForm(FormMode.JUST_DELETED);
      }
    } catch (err) {
      this.APIErrorHandler(err, 'Failed to remove this asset!');
    }
    this.resetMapOptions();
  }

  /**
   * Update center, zoom-level, reset map options - polygon, icon marker
   *  according to seleceted Zone, Terminal, Carpark, Level, etc
   */
  private resetMapOptions() {
    /**
     * mapCenter: this.mapCenter, mapZoomValue: this.mapZoomValue
     */
    const { mapCenter, mapZoomValue } = this.moveMapCenterZoom();
    const centerLocation = { lat: mapCenter[0], lng: mapCenter[1] };
    const Icon = this.markerIcon(this.selectedAssetType.selectedIcon);
    const marker = { icon: new Icon() };
    const [searchBar, polygon, circle, editing] = [true, false, false, true];
    this.mapOptions = new MapOptions(searchBar, polygon, circle, marker, editing, centerLocation);
  }
}
