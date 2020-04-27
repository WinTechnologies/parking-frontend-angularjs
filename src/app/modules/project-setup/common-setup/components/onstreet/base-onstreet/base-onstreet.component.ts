import {AbstractControl, FormGroup} from '@angular/forms';
import {ProjectZone} from 'app/modules/project-setup/common-setup/models/onstreet/project_zone.model';
import {Parking} from 'app/modules/project-setup/common-setup/models/onstreet/parking.model';
import {ProjectOpenLand} from 'app/modules/project-setup/common-setup/models/onstreet/project_openland.model';
import {Asset} from 'app/components/assets/models/asset.model';
import {environment} from 'environments/environment';

export const RADIUS = 6378137;

export abstract class BaseOnStreetComponent {
  public allZones: ProjectZone[];
  public parkings: Parking[];
  public openLands: ProjectOpenLand[];
  public parkingMeters: Asset[];
  public signages: Asset[];
  public apiEndpoint = environment.apiBase;



  // Add click event listener
  abstract onAdd(): void;

  public rad(_) {
    return _ * Math.PI / 180;
  }

  public inputCheck(event: any) {
    const pattern = /[a-zA-Z0-9\/\ ]/;
    const inputChar = event.keyCode ? String.fromCharCode(event.keyCode) : (event.clipboardData).getData('text');
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public distanceBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {

    const dLat = this.rad(lat2 - lat1);
    const dLon = this.rad(lon2 - lon1);

    lat1 = this.rad(lat1);
    lat2 = this.rad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return RADIUS * c;
  }

  public ringArea(coords) {
    let p1, p2, p3, lowerIndex, middleIndex, upperIndex, i, area = 0;
    const coordsLength = coords.length;

    if (coordsLength > 2) {
        for (i = 0; i < coordsLength; i++) {
            if (i === coordsLength - 2) {// i = N-2
                lowerIndex = coordsLength - 2;
                middleIndex = coordsLength - 1;
                upperIndex = 0;
            } else if (i === coordsLength - 1) {// i = N-1
                lowerIndex = coordsLength - 1;
                middleIndex = 0;
                upperIndex = 1;
            } else { // i = 0 to N-3
                lowerIndex = i;
                middleIndex = i + 1;
                upperIndex = i + 2;
            }
            p1 = coords[lowerIndex];
            p2 = coords[middleIndex];
            p3 = coords[upperIndex];
            area += ( this.rad(p3[0]) - this.rad(p1[0]) ) * Math.sin( this.rad(p2[1]));
        }

        area = Math.abs(area * RADIUS * RADIUS / 2);
    }

    return area;
  }

  public distanceInArea(coords: any[]) {
    const coordsLength = coords.length;
    let distance = 0;
    if (coordsLength > 2) {
      for (let i = 0; i < coordsLength; i++) {
        if (i > 0) {
          distance += this.distanceBetweenEarthCoordinates(
            coords[i - 1][1], coords[i - 1][0],
            coords[i][1], coords[i][0]
          );
        }
      }
    }

    return distance;
  }

  public removeErrorsFromForm(form: FormGroup) {
    let control: AbstractControl = null;
    form.markAsUntouched();
    Object.keys(form.controls).forEach((name) => {
      control = form.controls[name];
      control.setErrors(null);
    });
  }

  public formValid(form: FormGroup, excludeNames: string[]) {
    // when removing errors with removeErrorsFromForm function, it neeeds to be validate each field correctly.
    Object.keys(form.controls).forEach((name) => {
      const control = form.controls[name];
        if (control.value !== 0 && !control.value && !excludeNames.includes(name)) {
        control.setErrors({'required': true});
      }
    });

    return form.valid;
  }

  public _loadMapData(editables: any, callback: (array: any[]) => any) {
    const mapdataObj = {
      features: []
    };

    const clusterMapDataObj: any = {
      parkings: { features: [] },
      parkingMeters: { features: [] },
      signages: { features: [] },
      zones: { features: [] },
      openLands: { features: [] },
    };

    let parkings = this.parkings || [];
    let parkingMeters = this.parkingMeters || [];
    let signages = this.signages || [];
    let zones = this.allZones || [];
    let openLands = this.openLands || [];

    if (callback) {
      [parkings, parkingMeters, signages, zones, openLands] = callback([parkings, parkingMeters, signages, zones, openLands]);
    }

    // Display icon parking
    parkings.forEach(v => {
      // geoJSON Feature format - Point
      const marker = {
        type: 'Feature',
        properties: {
          options: { icon: { options: {
            iconUrl: '/assets/project-setup/onstreet/parking.svg',
            iconRetinaUrl: '/assets/project-setup/onstreet/parking.svg',
            iconSize: [48, 48],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [48, 48]
          }, _initHooksCalled: true } },

          info: { // info for popup of icon parking
            '<h5>Parking</h5>Type': v.parking_type, // title between the h5
            'Number': v.number.toLocaleString(['ban', 'id']),
            'Parking code': v.parking_code,
            'Name': v.name,
            'Zone ID': v.zone_id,
            'Parking spaces': v.parking_spaces.toLocaleString(['ban', 'id']),
            'Info notes': v.info_notes,
          },
          value: v,
          editable: editables.parking || false
        },
        geometry: {
          type: 'Point',
          coordinates: [v.latitude, v.longitude]
        }
      };
      mapdataObj.features.push(marker);
      clusterMapDataObj.parkings.features.push(marker);
    });

    // Display parking Meters
    parkingMeters.forEach( v => {
      const icon = v.img_url
        ? v.img_url.startsWith('uploads')
          ? this.apiEndpoint + '/' + v.img_url
          : v.img_url
        : v.model_img_url || 'No Icon';

      // geoJSON Feature format - Point
      const marker = {
        type: 'Feature',
        properties: {
          options: { icon: { options: {
            iconUrl: icon,
            iconRetinaUrl: icon,
            iconSize: [48, 48],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [48, 48]
          }, _initHooksCalled: true } },

          info: { // info for the popup park Meter
            '<h5>Parking Meter</h5>Codification ID': v.codification_id,
            'Parcmeter ID': v.codification_id,
            'Zone ID': v.zone_code,
            'Project ID': v.project_id,
            'Parcmeter code': v.model_code,
            'Parcmeter name': v.model_txt,
          },
          value: v,
          editable: editables.parkingMeter || false
        },
        geometry: {
          type: 'Point',
          coordinates: [v.latitude, v.longitude]
        }
      };
      mapdataObj.features.push(marker);
      clusterMapDataObj.parkingMeters.features.push(marker);
    });

    // Display Signages
    signages.forEach( v => {
      const icon = v.img_url
        ? v.img_url.startsWith('uploads')
          ? this.apiEndpoint + '/' + v.img_url
          : v.img_url
        : v.model_img_url || 'No Icon';

      // geoJSON Feature format - Point
      const marker = {
        type: 'Feature',
        properties: {
          options: { icon: { options: {
            iconUrl: icon,
            iconRetinaUrl: icon,
            iconSize: [48, 48],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [48, 48]
          }, _initHooksCalled: true } },
          info: { // the info for the popup signage
            '<h5>Signage</h5>Codification ID': v.codification_id,
            'Zone ID': v.zone_code,
            'Project ID': v.project_id,
            'Signage code': v.model_code,
            'Signage name': v.model_txt,
            },
          value: v,
          editable: editables.signage || false
        },
        geometry: {
          type: 'Point',
          coordinates: [v.latitude, v.longitude]
        }
      };
      mapdataObj.features.push(marker);
      clusterMapDataObj.signages.features.push(marker);
    });

    // Display Open Lands
    openLands.forEach( v => {
      // geoJSON Feature format - Polygon
      const polygon = {
        type: 'Feature',
        properties: {
          options: {
            color: 'red',
            weight : 3,
          },
          info: { // info for the popup Openlands
            '<h5>Open Land</h5>ID': v.id, // title between the h5
            'Land Code': v.land_code,
            'Land Name': v.land_name,
            'Zone ID': v.zone_id,
            'Project ID': v.project_id,
            'Perimeter': v.perimeter.toLocaleString(['ban', 'id']) + ' ( ' + v.measurement_unit + ' )',
            'Area': v.area.toLocaleString(['ban', 'id']) + ' ( Sq ' + v.measurement_unit + ' )',
            'Estimated spaces': v.estimated_spaces.toLocaleString(['ban', 'id'])
          },
          value: v,
          editable: editables.openLand || false
        },
        geometry: {
          type: 'Polygon',
          coordinates: [JSON.parse(v.connecting_points)]
        }
      };
      mapdataObj.features.push(polygon);
      clusterMapDataObj.openLands.features.push(polygon);
    });

    // Display zones
    zones.forEach( v => {
      // geoJSON Feature format - Polygon
      const polygon = {
        type: 'Feature',
        properties: {
          options: {
            color: 'orange',
            fillOpacity: 0,
            weight : 3,
          },
          info: { // the info for the popup zone
            '<h5>Zone</h5>ID': v.id, // title between the h5
            'Zone Code': v.zone_code,
            'Project ID': v.project_id,
            'Zone Name': v.zone_name,
            'Perimeter': v.perimeter.toLocaleString(['ban', 'id']) + ' ( ' + v.measurement_unit + ' )',
            'Area': v.area.toLocaleString(['ban', 'id']) + ' ( Sq ' + v.measurement_unit + ' )',
           },
          value: v,
          editable: editables.zone || false
        },
        geometry: {
          type: 'Polygon',
          coordinates: [JSON.parse(v.connecting_points)]
        }
      };
      mapdataObj.features.push(polygon);
      clusterMapDataObj.zones.features.push(polygon);
    });

    return {
      mapdataObj: JSON.stringify(mapdataObj),
      clusterMapDataObj: JSON.stringify(clusterMapDataObj),
    };
  }
}

