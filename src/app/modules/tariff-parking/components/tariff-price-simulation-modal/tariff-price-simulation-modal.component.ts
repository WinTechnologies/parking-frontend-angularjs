import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { LoaderService } from '../../../../services/loader.service';
import { TariffSegmentService } from '../../services/tariff-segment.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { ParkingStreetType } from '../../tariff-parking.const';

@Component({
  selector: 'app-tariff-price-simulation-modal',
  templateUrl: './tariff-price-simulation-modal.component.html',
  styleUrls: ['./tariff-price-simulation-modal.component.scss']
})
export class TariffPriceSimulationModalComponent implements OnInit {

  basicData: any;
  duration = {
    start_date: null,
    start_time: null,
    end_date: null,
    end_time: null,
  };
  parkingPriceResponse: any;

  ParkingStreetType = ParkingStreetType;

  constructor(
    public dialogRef: MatDialogRef<TariffPriceSimulationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
    private loaderService: LoaderService,
    private tariffSegmentService: TariffSegmentService,
    private toastrService: ToastrService,
  ) { }

  ngOnInit() {
    this.basicData = this.matDialogData;
  }

  public checkEnableCalc() {
    return this.duration.start_date && this.duration.start_time && this.duration.end_date && this.duration.end_time;
  }

  async onSubmit() {
    let params: any = {
      project_id: this.basicData.project.id,
      type_client: this.basicData.type_client,
      street_type: this.basicData.street_type,
      start_date: moment(this.duration.start_date).format('YYYY-MM-DD'),
      start_time: this.duration.start_time,
      end_date: moment(this.duration.end_date).format('YYYY-MM-DD'),
      end_time: this.duration.end_time
    };

    if (this.basicData.street_type === ParkingStreetType.OnStreet) {
      params = {...params, parking_id: this.basicData.parking.id};
    } else {
      params = {...params, carpark_zone_id: this.basicData.carpark_zone.id};
    }

    try {
      this.loaderService.enable();
      this.parkingPriceResponse = await this.tariffSegmentService.calculatePrice(params);
    } catch (e) {
      this.toastrService.error(e.error.message, 'Error');
    } finally {
      this.loaderService.disable();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
