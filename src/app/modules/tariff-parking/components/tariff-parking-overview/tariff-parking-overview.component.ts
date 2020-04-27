import { Component, OnInit } from '@angular/core';
import { PgProjectZoneService } from '../../../project-setup/common-setup/services/onstreet/project-zone.service';
import { TariffSegment } from '../../models/tariff-segment.model';
import { TariffSegmentService } from '../../services/tariff-segment.service';
import * as moment from 'moment';
import { config } from 'config';
import { ParkingClientType, ParkingStreetType, tariffParkingConfig } from '../../tariff-parking.const';
import { LoaderService } from '../../../../services/loader.service';
import { TariffPriceSimulationModalComponent } from '../tariff-price-simulation-modal/tariff-price-simulation-modal.component';
import { MatDialog } from '@angular/material';
import { Location } from '@angular/common';
import { PgProjectsService } from '../../../../components/projects/services/projects.service';
import { TariffParkingBasicService } from '../../services/tariff-parking-basic.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tariff-parking-overview',
  templateUrl: './tariff-parking-overview.component.html',
  styleUrls: ['./tariff-parking-overview.component.scss']
})
export class TariffParkingOverviewComponent implements OnInit {

  segment: TariffSegment;
  segments: TariffSegment[] = [];

  overviewTable = [];

  clientTypes = tariffParkingConfig.clientTypes;
  priceTypes = tariffParkingConfig.priceTypes;
  weekDays = config.weekDays;
  timeStepLabels = config.tariffParking.timeStepLabels;
  selectedProject = null;
  streetType = ParkingStreetType.OnStreet;
  ParkingStreetType = ParkingStreetType;

  basicData = {
    projects: [],
    zones: [],
    parkings: [],
    carparks: [],
    carparkZones: []
  };

  today = new Date();
  isEmptyTable = false;

  constructor(
    private readonly zoneService: PgProjectZoneService,
    private readonly projectService: PgProjectsService,
    private readonly tariffParkingBasicService: TariffParkingBasicService,
    private readonly tariffSegmentService: TariffSegmentService,
    private readonly loaderService: LoaderService,
    private dialog: MatDialog,
    public location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      this.segment = new TariffSegment();
      this.segment.type_client = ParkingClientType.VISITOR;
      this.segment.is_onstreet = true;
      this.basicData.projects = await this.tariffParkingBasicService.getProjects();
      this.makeEmptyTable();
    } finally {
      this.loaderService.disable();
    }
  }

  public async onChangeBasicData(dataType) {
    try {
      this.loaderService.enable();
      let params = {};
      switch (dataType) {
        case 'project':
          this.segment.project_id = this.selectedProject.id;
          params = {project_id: this.segment.project_id};
          this.basicData.zones = await this.tariffParkingBasicService.getZones(params);
          this.basicData.parkings = [];
          this.basicData.carparks = [];
          this.basicData.carparkZones = [];

          this.segment.zone_id = null;
          this.segment.parking_id = null;
          this.segment.carpark_id = null;
          this.segment.carpark_zone_id = null;
          break;
        case 'zone':
          if (this.segment.project_id && this.segment.zone_id) {
            params = {project_id: this.segment.project_id, zone_id: this.segment.zone_id};
            if (this.streetType === ParkingStreetType.OnStreet) {
              this.basicData.parkings = await this.tariffParkingBasicService.getParkings(params);
            } else {
              this.basicData.carparks = await this.tariffParkingBasicService.getCarParks(params);
              this.basicData.carparkZones = [];
            }
          }
          this.segment.parking_id = null;
          this.segment.carpark_id = null;
          this.segment.carpark_zone_id = null;
          break;
        case 'carpark':
          params = {carpark_id: this.segment.carpark_id};
          this.basicData.carparkZones = await this.tariffParkingBasicService.getCarParkZones(params);
          this.segment.carpark_zone_id = null;
          break;
        default:
          break;
      }
    } finally {
      this.loaderService.disable();
    }

    if (this.checkPossibleData()) {
      this.getOverview();
    } else {
      this.segments = [];
      if (!this.isEmptyTable) {
        this.makeEmptyTable();
      }
    }
  }

  public checkPossibleData() {
    return this.segment.is_onstreet && this.segment.parking_id || !this.segment.is_onstreet && this.segment.carpark_zone_id;
  }

  private makeEmptyTable() {
    this.isEmptyTable = true;
    const overviewTable = [];
    const today = new Date();
    const start_of_week = today.getDate() - today.getDay();
    const start_date = new Date().setDate(start_of_week);
    const end_date = new Date().setDate(start_of_week + 7 * 5 - 1);
    for (const m = moment(start_date); m.diff(end_date, 'days') <= 0; m.add(7, 'days')) {
      const week = {start: '', end: '', days: [[], [], [], [], [], [], []]};
      week.start = moment(m).format('YYYY-MM-DD');
      week.end = moment(m).add(6, 'days').format('YYYY-MM-DD');
      overviewTable.push(week);
    }
    this.overviewTable = [...overviewTable];
  }

  getClass(type: string) {
    switch (type) {
      case 'Absolute': return 'absolute-type';
      case 'Custom': return 'custom-type';
      case 'Ladder': return 'ladder-type';
      case 'Fixed Rate': return 'fixed-type';
    }
  }

  public async getOverview(event?: any) {
    const today = moment();
    const fromDate = moment(today.startOf('isoWeek'));
    const toDate = moment(fromDate).add(7 * 5 - 1, 'days');

    try {
      this.loaderService.enable();
      const params = this.makeFilterParams(this.segment);
      const [segments, overviewResult] = await Promise.all([
        this.tariffSegmentService.get(params),
        this.tariffSegmentService.getOverview({
          ...params,
          from: fromDate.format('YYYY-MM-DD'),
          to: toDate.format('YYYY-MM-DD')
        })
      ]);
      this.segments = [...segments];

      if (overviewResult) {
        const durationDays = Object.keys(overviewResult);
        const overviewTable = [];
        let week = {start: '', end: '', days: []};
        for (let dayIndex = 0; dayIndex <= toDate.diff(fromDate, 'days'); dayIndex++) {
          if (dayIndex % 7 === 0) {
            week = {start: durationDays[dayIndex], end: durationDays[dayIndex + 6], days: []};
          }
          week.days.push(overviewResult[durationDays[dayIndex]]);
          if (dayIndex % 7 === 6) {
            overviewTable.push(week);
          }
        }
        this.overviewTable = [...overviewTable];
        this.isEmptyTable = false;
      } else {
        this.makeEmptyTable();
      }
    } finally {
      this.loaderService.disable();
    }
  }

  private makeFilterParams(segment) {
    let params: any = {
      type_client: segment.type_client,
      is_onstreet: this.streetType === ParkingStreetType.OnStreet
    };

    if (params.is_onstreet) {
      params = {...params, parking_id: segment.parking_id};
    } else {
      params = {...params, carpark_zone_id: segment.carpark_zone_id};
    }
    return params;
  }

  public createSegment(period: any, dayofweek: number, start: string, end: string) {
    const startOfWeek = new Date(period.start);
    this.segment.applicable_days = this.weekDays[dayofweek].key;
    this.segment.date_start = moment(startOfWeek.setDate(startOfWeek.getDate() + dayofweek)).format('YYYY-MM-DD');
    this.segment.date_end = moment(startOfWeek.setDate(startOfWeek.getDate() + 1)).format('YYYY-MM-DD');
    this.segment.time_start = start;
    this.segment.time_end = end;
    this.router.navigate(['details/new'], { relativeTo: this.activatedRoute, state: this.segment });
  }

  public editSegment(segment) {
    if (segment.id) {
      this.router.navigate(['details', segment.id], { relativeTo: this.activatedRoute});
    } else {
      this.router.navigate(['details/new'], { relativeTo: this.activatedRoute, state: segment });
    }
  }

  public onChangeStreetType(event) {
    this.segment.is_onstreet = event.value === ParkingStreetType.OnStreet;
    this.onChangeBasicData('zone');
  }

  public onShowCalculationPrice() {
    const data: any = {
      project: this.basicData.projects.find(project => project.id === this.segment.project_id),
      zone: this.basicData.zones.find(zone => zone.id === this.segment.zone_id),
      type_client: this.segment.type_client,
      street_type: this.streetType
    };

    if (this.streetType === ParkingStreetType.OnStreet) {
      data.parking = this.basicData.parkings.find(parking => parking.id === this.segment.parking_id);
    } else {
      data.carpark = this.basicData.carparks.find(carpark => carpark.id === this.segment.carpark_id);
      data.carpark_zone = this.basicData.carparkZones.find(carpark_zone => carpark_zone.id === this.segment.carpark_zone_id);
    }

    const dialogRef = this.dialog.open(TariffPriceSimulationModalComponent, {
      width: '760px',
      data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  public goToDetails() {
    this.router.navigate(['details/new'], { relativeTo: this.activatedRoute, state: this.segment });
  }

}
