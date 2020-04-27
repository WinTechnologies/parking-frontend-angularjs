import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Job } from '../../../../../shared/classes/job';
import MapOptions from '../../../../../shared/classes/MapOptions';
import { config } from '../../../../../../config';
import { environment } from '../../../../../../environments/environment';
import { Job_Details_Fields } from '../../../fixtures/job.fixture';

@Component({
  selector: 'app-violation-map-modal',
  templateUrl: './violation-map.component.html',
  styleUrls: ['./violation-map.component.scss']
})

export class JobViolationModalComponent implements OnInit {
  job: Job;
  statusCodes = [];
  violationPictures = [];

  mapOptions: MapOptions;
  contraventionImagePath: string;
  mapCenter: any;
  statusLabels = config.contraventionStatus;
  mapdata = '{"type": "FeatureCollection", "features": []}';

  baseUrl = environment.apiBase;
  Job_Details_Fields = Job_Details_Fields;
  jobTypeImagePath: string;

  constructor(
    public dialogRef: MatDialogRef<JobViolationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
  ) { }

  ngOnInit() {
    this.job = this.matDialogData.job;
    this.setMapOptions();
    this.loadMapData();
  }

  private setMapOptions() {
    if (this.job) {
      this.mapCenter = [this.job.latitude, this.job.longitude];
      this.mapOptions = new MapOptions(
        true,
        false,
        false,
        // { icon: Job.getJobTypeDefaultIcon() },
        { icon: Job.getJobIcon(this.job.job_type, this.job.status) },
        false,
        { lat: this.job.latitude, lng: this.job.longitude }
      );
    }

  }
  private loadMapData() {
    if (this.job) {
      const mapdataObj = {
        features: []
      };
      let icon = Job.getJobIcon(this.job.job_type, this.job.status);
      icon = icon ? icon : 'default_icon';
      this.jobTypeImagePath = '/assets/job-icons/' + icon + '.svg';

      const jobMarker = {
        type: 'Feature',
        properties: {
          options: {
            icon: {
              options: {
                iconUrl: this.jobTypeImagePath,
                iconRetinaUrl: this.jobTypeImagePath,
                iconSize: [48, 48],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [48, 48]
              },
              _initHooksCalled: true
            }
          }
          // info: {
          //   '<h5>Jobs</h5> Type ': this.job.job_type,
          //   // 'Picture: <img src=[v.violation_picture] width = \'20px\'> </br> ' +
          //   'Car brand': this.job.car_brand,
          //   'Car model': this.job.car_model,
          //   'Car licence plate': this.job.car_licence_plate,
          //   'Project ID': this.job.project_id,
          //   'Project name': this.job.project_name,
          //   'Zone name': this.job.zone_name,
          //   'Created at': this.job.creation
          // }
        },
        geometry: {
          type: 'Point',
          coordinates: [this.job.latitude, this.job.longitude]
        }
      };
      mapdataObj.features.push(jobMarker);
      if (this.mapdata !== JSON.stringify(mapdataObj)) {
        this.mapdata = JSON.stringify(mapdataObj);
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

}