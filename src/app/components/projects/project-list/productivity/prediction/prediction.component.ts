import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PgActEnforcementPredictionService } from './service/act-enforcement-prediction.service';
import { Project } from '../../../models/project.model';
import { PgActEnforcementPrediction } from './model/act-enforcement-prediction';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.scss']
})

export class PredictionComponent implements OnInit, OnChanges {
  @Input() project: Project;
  @Input() job_position: string;
  @Input() canUpdate = false;

  prediction: PgActEnforcementPrediction = new PgActEnforcementPrediction();

  operating_hours_hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  operating_hours_min = [360, 420, 480, 540, 600, 660, 720, 780, 840, 900];
  changeFlag = false;
  issuance_rate = 0;
  forecast_deployed = 0;
  forecast_per_unity = 0;

  constructor(
    private pgActEnforcementPredictionService: PgActEnforcementPredictionService,
    public toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.initPrediction();
    this.getPredictions();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initPrediction();
    this.getPredictions();
  }

  initPrediction() {
    this.prediction.id = '';
    this.prediction.job_position = this.job_position;
    this.prediction.issuance_rate = 0;
    this.prediction.issuance_unity = 'min';
    this.prediction.forecast_deployed = 0;
    this.prediction.project_id = this.project.id;
    this.prediction.project_name = this.project.project_name;
    this.prediction.forecast_per_unity = 0;
    this.prediction.nbr_spaces_on_street_parking = this.project.parking_spaces;

    if (this.job_position === 'Tow Truck' || this.job_position === 'Clamp Van') {
      this.prediction.groupage = 'Fleet';
      this.prediction.forecast_unity = 'jobs';
      this.prediction.expected_unity = 'jobs';
    } else {
      this.prediction.groupage = 'Team';
      this.prediction.forecast_unity = 'spaces';
      this.prediction.expected_unity = 'CNs';
    }
  }

  getPredictions() {
    this.issuance_rate = 0;
    this.forecast_per_unity = 0;
    this.forecast_deployed = 0;
    this.pgActEnforcementPredictionService.get(this.project.id).subscribe(result => {
      const selectedPrediction = result.find(prediction => prediction.job_position === this.job_position);
      if (selectedPrediction) {
        if (selectedPrediction.id) {
          this.prediction.id = selectedPrediction.id;
        }
        this.prediction.issuance_rate = selectedPrediction.issuance_rate;
        this.prediction.forecast_deployed = selectedPrediction.forecast_deployed;
        this.prediction.forecast_per_unity = selectedPrediction.forecast_per_unity;
        this.issuance_rate = selectedPrediction.issuance_rate;
        this.forecast_per_unity = selectedPrediction.forecast_per_unity;
        this.forecast_deployed = selectedPrediction.forecast_deployed;
        this.setForecastDeployed();
      }
    });
  }

  setForecastDeployed() {
    if (this.prediction.forecast_per_unity  > 0) {
      this.prediction.forecast_deployed = Math.round((this.project.parking_spaces ? this.project.parking_spaces : 0) / this.prediction.forecast_per_unity);
    } else {
      this.prediction.forecast_deployed = 0;
    }
    this.changeFlag = !(this.issuance_rate === this.prediction.issuance_rate && this.forecast_per_unity === this.prediction.forecast_per_unity && this.forecast_deployed === this.prediction.forecast_deployed);
  }

  onSubmit() {
    if (this.prediction.id) {
      this.pgActEnforcementPredictionService.update(this.prediction.id, this.prediction).subscribe(data => {
        this.toastrService.success('The prediction is updated successfully!', 'Success!');
        this.issuance_rate = this.prediction.issuance_rate;
        this.forecast_per_unity = this.prediction.forecast_per_unity;
        this.forecast_deployed = this.prediction.forecast_deployed;
        this.changeFlag = false;
      }, err => {
        this.toastrService.error('', 'Error!');
      });
    } else {
      this.pgActEnforcementPredictionService.create(this.prediction).subscribe(res => {
        this.toastrService.success('The prediction is added succesfully!', 'Success!');
        this.issuance_rate = this.prediction.issuance_rate;
        this.forecast_per_unity = this.prediction.forecast_per_unity;
        this.forecast_deployed = this.prediction.forecast_deployed;
        this.changeFlag = false;
      }, err => {
        this.toastrService.error('', 'Error!');
      });
    }
  }
}