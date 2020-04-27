import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TariffSegment } from '../../../models/tariff-segment.model';
import { TariffParkingBasicService } from '../../../services/tariff-parking-basic.service';
import { LoaderService } from '../../../../../services/loader.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ParkingStreetType, tariffParkingConfig } from '../../../tariff-parking.const';

@Component({
  selector: 'app-tariff-parking-basic',
  templateUrl: './tariff-parking-basic.component.html',
  styleUrls: ['./tariff-parking-basic.component.scss']
})
export class TariffParkingBasicComponent implements OnInit {
  @Input() form: FormGroup;
  @Output() updateBasicData = new EventEmitter();

  segment = new TariffSegment();
  clientTypes = tariffParkingConfig.clientTypes;
  ParkingStreetType = ParkingStreetType;
  basicData = {
    projects: [],
    zones: [],
    parkings: [],
    carparks: [],
    carparkZones: []
  };

  constructor(
    private tariffParkingBasicService: TariffParkingBasicService,
    private loaderService: LoaderService,
  ) { }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      this.segment = {...this.form.value};
      this.basicData.projects = await this.tariffParkingBasicService.getProjects();
      if (this.form.value.project_id) {
        let params: any = {project_id: this.form.value.project_id};
        this.basicData.zones = await this.tariffParkingBasicService.getZones(params);

        if (this.form.value.zone_id) {
          params = {...params, zone_id: this.form.value.zone_id};
          if (this.form.value.street_type === ParkingStreetType.OnStreet) {
            this.basicData.parkings = await this.tariffParkingBasicService.getParkings(params);
          } else {
            this.basicData.carparks = await this.tariffParkingBasicService.getCarParks(params);
            if (this.form.value.carpark_id) {
              params = {carpark_id: this.form.value.carpark_id};
              this.basicData.carparkZones = await this.tariffParkingBasicService.getCarParkZones(params);
            }
          }
        }
      }

      this.updateBasicData.emit(this.form.value);
      this.onChangeStreetType({value: this.form.value.street_type}, true);
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
          params = {project_id: this.form.value.project_id};
          this.basicData.zones = await this.tariffParkingBasicService.getZones(params);
          this.basicData.parkings = [];
          this.basicData.carparks = [];
          this.basicData.carparkZones = [];
          this.form.patchValue({zone_id: null, parking_id: null, carpark_id: null, carpark_zone_id: null});
          break;
        case 'zone':
          if (this.form.value.project_id && this.form.value.zone_id) {
            params = {project_id: this.form.value.project_id, zone_id: this.form.value.zone_id};
            if (this.form.value.street_type === ParkingStreetType.OnStreet) {
              this.basicData.parkings = await this.tariffParkingBasicService.getParkings(params);
            } else {
              this.basicData.carparks = await this.tariffParkingBasicService.getCarParks(params);
              this.basicData.carparkZones = [];
            }
          }
          this.form.patchValue({parking_id: null, carpark_id: null, carpark_zone_id: null});
          break;
        case 'carpark':
          params = {carpark_id: this.form.value.carpark_id};
          this.basicData.carparkZones = await this.tariffParkingBasicService.getCarParkZones(params);
          this.form.patchValue({carpark_zone_id: null});
          break;
        default:
          break;
      }
      this.updateBasicData.emit(this.form.value);
    } finally {
      this.loaderService.disable();
    }
  }

  onChangeStreetType(event, init = false) {
    if (event.value === ParkingStreetType.OnStreet) {
      this.form.removeControl('carpark_id');
      this.form.removeControl('carpark_zone_id');

      if (!this.form.get('parking_id')) {
        this.form.addControl('parking_id', new FormControl(init ? this.segment.parking_id : null, Validators.required));
      }
    } else {
      this.form.removeControl('parking_id');

      if (!this.form.get('carpark_id')) {
        this.form.addControl('carpark_id', new FormControl(init ? this.segment.carpark_id : null, Validators.required));
      }
      if (!this.form.get('carpark_zone_id')) {
        this.form.addControl('carpark_zone_id', new FormControl(init ? this.segment.carpark_zone_id : null, Validators.required));
      }
    }

    if (!init) {
      this.onChangeBasicData('zone');
    }
  }

}
