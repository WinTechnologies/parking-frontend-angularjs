import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Contravention } from '../../../../../shared/classes/contravention';
import MapOptions from '../../../../../shared/classes/MapOptions';
import { config } from '../../../../../../config';
import { environment } from '../../../../../../environments/environment';
import { CN_Details_Fields } from '../../../fixtures/contravention.fixture';

@Component({
  selector: 'app-violation-map-modal',
  templateUrl: './violation-map.component.html',
  styleUrls: ['./violation-map.component.scss']
})

export class ViolationMapModalComponent implements OnInit {
  contravention: Contravention;
  statusCodes = [];
  violationPictures = [];

  mapOptions: MapOptions;
  contraventionImagePath: string;
  mapCenter: any;
  statusLabels = config.contraventionStatus;
  mapdata = '{"type": "FeatureCollection", "features": []}';

  baseUrl = environment.apiBase;
  CN_Details_Fields = CN_Details_Fields;

  constructor(
    public dialogRef: MatDialogRef<ViolationMapModalComponent>,
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
  ) { }

  ngOnInit() {
    this.statusCodes = this.matDialogData.statusCodes;
    this.contravention = this.matDialogData.contravention;
    this.setMapOptions();
    this.loadMapData();
  }

  private setMapOptions() {
    if (this.contravention) {
      this.mapCenter = [this.contravention.latitude, this.contravention.longitude];
      this.mapOptions = new MapOptions(
        true,
        false,
        false,
        false,
        // { icon: Contravention.getContraventionTypeDefaultIcon()  },
        false,
        { lat: this.contravention.latitude, lng: this.contravention.longitude }
      );
    }

  }
  private loadMapData() {
    if (this.contravention) {
      const mapdataObj = {
        features: []
      };
      let type;
      switch (this.contravention.status) {
        case '0' :
          this.contraventionImagePath = '/assets/contravention-icons/observation.svg';
          type = 'Observation';
          break;
        case '1' :
          this.contraventionImagePath = '/assets/contravention-icons/contravention.svg';
          type = 'Contravention';
          break;
        case '2' :
          this.contraventionImagePath = '/assets/contravention-icons/canceled_contravention.svg';
          type = 'Canceled Observation';
          break;
        case '3' :
          this.contraventionImagePath = '/assets/contravention-icons/evolved-into-contravention-observation.svg';
          type = 'Evolved-into-contravention Observation';
          break;
        default:
          this.contraventionImagePath = '/assets/contravention-icons/contravention.svg';
          type = 'Contravention';
          break;
      }

      const contraventionMarker = {
        type: 'Feature',
        properties: {
          options: {
            icon: {
              options: {
                iconUrl: this.contraventionImagePath,
                iconRetinaUrl: this.contraventionImagePath,
                iconSize: [48, 48],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [48, 48]
              },
              _initHooksCalled: true
            }
          }
        },
        geometry: {
          type: 'Point',
          coordinates: [this.contravention.latitude, this.contravention.longitude]
        }
      };
      mapdataObj.features.push(contraventionMarker);
      if (this.mapdata !== JSON.stringify(mapdataObj)) {
        this.mapdata = JSON.stringify(mapdataObj);
      }
    }
  }
  onCancel() {
    this.dialogRef.close();
  }
}