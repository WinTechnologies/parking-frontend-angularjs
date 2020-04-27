import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BaseCarparkComponent} from '../base-carpark/base-carpark.component';
import {FormMode, ViewMode, CarparkItemType, CarparkItemLevel} from '../../models/carpark.model';
import {EmptyPrZone, ProjectZone} from '../../../common-setup/models/onstreet/project_zone.model';
import {Terminal, Airport} from '../../models/carpark-items.model';
import MapOptions from '../../../../../shared/classes/MapOptions';

import {CarparkDataService} from '../../services/carpark-data.service';
import {TerminalService} from '../../services/terminal.service';
import {CarparkService} from '../../services/carpark.service';
import {CarparkLevelService} from '../../services/carpark-level.service';
import {CarparkZoneService} from '../../services/carpark-zone.service';
import {GateService} from '../../services/gate.service';
import {LaneService} from '../../services/lane.service';
import {ParkSpaceService} from '../../services/park-space.service';
import {PgProjectOpenLandService} from '../../../common-setup/services/onstreet/project-openland.service';
import {PgAssetService} from '../../../../../components/assets/services/assets.service';
import {ToastrService} from 'ngx-toastr';

import {forkJoin, Observable, Subject} from 'rxjs';
import {debounceTime, finalize, switchMap, tap} from 'rxjs/operators';
import {CarparkAssetsService} from '../../services/carpark-assets.service';
import {UploadService} from '../../../../../services/upload.service';

@Component({
  selector: 'app-project-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent extends BaseCarparkComponent implements OnInit, OnDestroy, OnChanges {
  ViewMode = ViewMode;
  FormMode = FormMode;
  CarparkItemType = CarparkItemType;

  @Input() projectId: number;
  @Input() viewMode: ViewMode;
  @Input() formMode: FormMode;
  @Input() showOptions: string[];
  @Output() changeFormMode = new EventEmitter<FormMode>();

  form: FormGroup;

  filteredAirports: Airport[];
  filteredAirports$: Observable<Airport[]>;
  isAirportsLoading = false;
  imgFiles: File[];
  public options: any;

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
    private readonly projectOpenLandService: PgProjectOpenLandService,
    private readonly assetService: PgAssetService,
    private readonly router: Router,
    private readonly uploadService: UploadService,
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

  ngOnInit() {
    this.options = {
      app: 'web',
      section: 'projects',
      sub: ''
    };

    this.resetMapOptions();
    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);
    }

    this.buildForm();
    this.loadMapData(CarparkItemLevel.Terminal, { terminal: true }, this.showOptions);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.filter || changes.showOptions) {
      this.loadMapData(CarparkItemLevel.Terminal, { terminal: true }, this.showOptions);
    }
    if (changes.formMode && this.formMode === FormMode.CREATING) {
      this.resetForm();
      const terminalCode = await this.terminalService.getTerminalCode();
      this.form.controls['terminal_code'].setValue(terminalCode);
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      project_id: [this.selectedZone ? this.selectedZone.project_id : this.projectId, [Validators.required]],
      zone_id: [this.selectedZone ? this.selectedZone.id : null, [Validators.required]],
      terminal_code: [this.selectedTerminal ? this.selectedTerminal.terminal_code : '', [Validators.required]],
      terminal_name: [this.selectedTerminal ? this.selectedTerminal.terminal_name : '', [Validators.required]],
      airport_code: [this.selectedTerminal ? this.selectedTerminal.airport_code : '', [Validators.required]],
      airport_name: [this.selectedTerminal ? this.selectedTerminal.airport_name : '', [Validators.required]],
      latitude: [this.selectedTerminal ? this.selectedTerminal.latitude : '', [Validators.required]],
      longitude: [this.selectedTerminal ? this.selectedTerminal.longitude : '', [Validators.required]],
      connecting_points: [this.selectedTerminal ? this.selectedTerminal.connecting_points : JSON.stringify([]), [Validators.required]],
      notes: this.selectedTerminal ? this.selectedTerminal.notes : '',
    });

    this.filteredAirports$ = this.form.controls['airport_name'].valueChanges
      .pipe(
        // startWith(''),
        debounceTime(300),
        tap(() => this.isAirportsLoading = true),
        switchMap((v: string) =>  this.terminalService.getAirports(v.toLowerCase())
          .pipe( finalize(() => this.isAirportsLoading = false) )
        )
      );

    this.filteredAirports$
      .takeUntil(this.destroy$)
      .subscribe(airports => this.filteredAirports = airports);
  }

  public onSiteMapDataChanged(mapdata: any) {
    const mapdataObj = JSON.parse(mapdata);
    if (
      mapdataObj &&
      mapdataObj.features.length > 0 &&
      mapdataObj.features[0].geometry &&
      mapdataObj.features[0].geometry.coordinates
    ) {
      /*
        mapdataObj.features[0]: Coordinate Info
        mapdataObj.features[1]: Center lat, lng Info
       */
      let center_point;
      const points = mapdataObj.features[0].geometry.coordinates[0];

      // Before adding centroid point of Polygon
      if (mapdataObj.features.length === 1) {
        // Init Centroid point of polygon
        center_point = points[0];
        if (points.length > 3) {
          center_point[0] = points[0][0] + (points[1][0] - points[0][0]) / 2;
          center_point[1] = points[0][1] + (points[1][1] - points[0][1]) / 2;
        }
        const centerMarker = {
          type: 'Feature',
          properties: {
            options: { icon: { options: {
                  iconUrl: '/assets/project-setup/Terminal_selected.svg',
                  iconRetinaUrl: '/assets/project-setup/Terminal_selected.svg',
                  iconSize: [48, 48],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  tooltipAnchor: [16, -28],
                  shadowSize: [48, 48]
                }, _initHooksCalled: true } },
          },
          geometry: {
            type: 'Point',
            coordinates: center_point
          }
        };
        mapdataObj.features.push(centerMarker);

      // After adding centroid point of Polygon
      } else if (mapdataObj.features.length === 2) {
        center_point = mapdataObj.features[1].geometry.coordinates;
      }

      this.form.controls['connecting_points'].setValue(JSON.stringify(points));
      this.form.controls['latitude'].setValue(center_point[0]);
      this.form.controls['longitude'].setValue(center_point[1]);
      this.tabMapDrawDataJSON = JSON.stringify(mapdataObj);
    } else {
      this.form.controls['connecting_points'].setValue(JSON.stringify([]));
      this.form.controls['latitude'].setValue(0);
      this.form.controls['longitude'].setValue(0);
    }
  }

  async saveTerminal(terminal: Terminal)
  {
    if (this.formValid(this.form, ['notes'])) {
      if (this.formMode === FormMode.UPDATING) {
        terminal.id = this.selectedTerminal.id;
        await this.terminalService.update(terminal);
        this.toastr.success('The terminal is updated successfully!', 'Success!');
        this.terminals = this.terminals
          .filter(t => t.id !== terminal.id)
          .concat([terminal as Terminal]);
        this.allTerminals = this.allTerminals
          .filter(t => t.id !== terminal.id)
          .concat([terminal as Terminal]);
        this.resetForm(FormMode.JUST_UPDATED);
      } else if (this.formMode === FormMode.CREATING) {
        const res = await this.terminalService.create(terminal);
        terminal.id = res.id;
        this.terminals.push(terminal);
        this.allTerminals.push(terminal);
        this.toastr.success('A terminal is created successfully!', 'Success!');
        this.resetForm(FormMode.JUST_CREATED);
      }
    }
  }

  public onSubmit() {
    const terminal = this.form.value as Terminal;
    if (this.imgFiles && this.imgFiles.length && this.formValid(this.form,['notes'])) {
      this.uploadService.uploadOneByPurpose(this.imgFiles, this.options).subscribe(result => {
        terminal.img_url = result;
        this.saveTerminal(terminal);
      });
    } else {
      this.toastr.error('Please upload a image for this terminal', 'Error!');
    }
  }

  public returnToSelection() {
    this.formMode = FormMode.SELECTING;
    this.changeFormMode.emit(this.formMode);
  }

  public onZoneSelection(zone: ProjectZone) {
    this.selectedZone = zone === EmptyPrZone
      ? EmptyPrZone // All Zone
      : this.allZones.find(v => v.id === zone.id);

    if (this.selectedZone && this.selectedZone.id) {
      this.resetForm(FormMode.SELECTING);
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Terminal, { terminal: true }, this.showOptions);
    }
  }

  public onTerminalSelection(terminal: Terminal) {
    this.selectedTerminal = this.terminals.find(v => v.id === terminal.id);
    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.fillUpdateForm();
      this.resetMapOptions();
      this.loadMapData(CarparkItemLevel.Terminal, { terminal: true }, this.showOptions);
    }
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
    this.loadMapData(CarparkItemLevel.Terminal, { terminal: true }, this.showOptions);
  }

  private fillUpdateForm() {
    if (this.selectedTerminal && this.selectedTerminal.id) {
      this.formMode = FormMode.UPDATING;
      this.changeFormMode.emit(this.formMode);

      this.form.reset({
        project_id: this.selectedZone.project_id,
        zone_id: this.selectedZone.id,
        terminal_code: this.selectedTerminal.terminal_code,
        terminal_name: this.selectedTerminal.terminal_name,
        airport_code: this.selectedTerminal.airport_code,
        airport_name: this.selectedTerminal.airport_name,
        latitude: this.selectedTerminal.latitude,
        longitude: this.selectedTerminal.longitude,
        connecting_points: this.selectedTerminal.connecting_points,
        img_url: this.selectedTerminal.img_url,
        notes: this.selectedTerminal.notes
      });
    }
  }

  private resetForm(nextFormMode: FormMode = null) {
    if (nextFormMode !== null) {
      this.formMode = nextFormMode;
      this.changeFormMode.emit(this.formMode);
    }

    this.selectedTerminal = new Terminal();

    this.form.reset({
      project_id: this.selectedZone ? this.selectedZone.project_id : null,
      zone_id: this.selectedZone ? this.selectedZone.id : null,
      terminal_code: '',
      terminal_name: '',
      airport_code: '',
      airport_name: '',
      latitude: '',
      longitude: '',
      connecting_points: JSON.stringify([]),
      img_url: '',
      notes: ''
    });
    this.removeErrorsFromForm(this.form);
    this.tabMapDrawDataJSON = '';
  }

  async onDeleteCurrentTerminal() {
    try {
      if (window.confirm('This action is not reversible! Are you sure you want to delete ?')) {
        await this.terminalService.delete(this.selectedTerminal.id);
        this.toastr.success('The terminal has been removed successfully!', 'Success!');
        this.terminals = this.terminals
          .filter(t => t.id !== this.selectedTerminal.id);
        this.allTerminals = this.allTerminals
          .filter(t => t.id !== this.selectedTerminal.id);
        this.resetForm(FormMode.JUST_DELETED);
      }
    } catch (err) {
      this.APIErrorHandler(err, 'Failed to remove this terminal!');
    }
  }

  matchAirportCode(name: string) {
    const airport = this.filteredAirports.find(el => el.name === name);
    if (airport && airport.iata) {
      this.form.controls['airport_code'].setValue(airport.iata);
    } else {
      this.toastr.error('Airport IATA code not found!', 'Error!');
    }
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
    const polygon = {
      shapeOptions: {
        color: 'orange',
        fillOpacity: 0,
        weight : 3,
      }
    };
    const [searchBar, circle, marker, editing] = [true, false, false, true];
    this.mapOptions = new MapOptions(searchBar, polygon, circle, marker, editing, centerLocation);
  }

  public onImageAdded(event: any) {
    this.imgFiles = event.currentFiles;

    for (let i = 0; i < this.imgFiles.length; i++) {
      let file = this.imgFiles[i];
      let imgFileType = file.type === 'image/x-icon' || file.type.match('image.*')? true : false;

      if (!imgFileType) {
        this.onRemoveResource(i);
        this.toastr.error('Document file format is invalid.', 'Error');
        return;
      }
    }
  }
  public onRemoveResource(index: number) {
    this.imgFiles.splice(index, 1);
  }

  public onRemoveImage() {
    this.selectedTerminal.img_url = '';
  }

}
