import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface Zone {
  zone_id: number;
  zone_name: string;
  zone_code: string;
  connecting_points: string;
  list: any[];
}

@Component({
  selector: 'app-project-zones-selector',
  templateUrl: './project-zones-selector.component.html',
  styleUrls: ['./project-zones-selector.component.scss']
})
export class ProjectZonesSelectorComponent implements OnInit {

  @Input() project_id;
  @Input() selectedZones = [];
  @Input() assignment = false;
  @Output() selectZones = new EventEmitter();

  zones;
  selectedParkings = {};
  coordinates = { markers: [], polylines: [] };

  isMapShow = false;
  searchText;

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit() {
    if( this.assignment ){
      this.getZonesByProject();
    } else {
      this.getZones();
    }
  }

  getZonesByProject() {
    this.apiService.get('/pg/project-zones/with-project', {project_id: this.project_id})
      .then(value => {
        this.zones = value.map(zone => {
          return {
            ...zone,
            isSelected: !!this.selectedZones.find(zone_id => zone_id === zone.zone_id)
          };
        });
        this.selectZones.emit(this.zones.filter(zone => zone.isSelected).map(zone => zone.zone_id));
        this.zones.forEach(zone => {
          this.coordinates.polylines.push({ coords: JSON.parse(zone.connecting_points), zone_id: zone.zone_id, zone_name: zone.zone_name, isSelected: zone.isSelected });
        });
      });
  }

  getZones() {
    this.apiService.get('/pg/project-zones/with-parkings', {project_id: this.project_id})
      .then(value => {
        this.zones = value.map(zone => {
          return {
            ...zone,
            isSelected: !!this.selectedZones.find(zone_id => zone_id === zone.zone_id)
          };
        });
        this.selectZones.emit(this.zones.filter(zone => zone.isSelected).map(zone => zone.zone_id));
        this.zones.forEach(zone => {
          this.coordinates.polylines.push({ coords: JSON.parse(zone.connecting_points), zone_id: zone.zone_id, zone_name: zone.zone_name, isSelected: zone.isSelected });
        });
      });
  }

  onSelectPIN(event, id, zone_id) {
    if (!this.selectedParkings[zone_id]) {
      this.selectedParkings[zone_id] = {};
    }
    if (this.selectedParkings[zone_id][id] && !event.checked) {
      delete this.selectedParkings[zone_id][id];
    } else {
      this.selectedParkings[zone_id][id] = event.checked;
    }
    this.coordinates.polylines.find(elem => elem.zone_id === zone_id)['isSelected'] = event.checked;
  }

  onSelectZone(event, zone_id) {
    const index = this.zones.findIndex(zone => zone.zone_id === zone_id);
    this.zones[index].isSelected = event.checked;
    const parkingIds = this.zones[index].list.map(parking => parking.id);
    parkingIds.forEach(parkingId => {
      this.onSelectPIN(event, parkingId, zone_id);
    });
    this.selectZones.emit(this.zones.filter(zone => zone.isSelected).map(zone => zone.zone_id));
  }

  toggleMap() {
    this.isMapShow = !this.isMapShow;
  }

  onSelectAll(isSelected) {
    this.zones
      .filter(element => element.list.length > 0)
      .forEach(element => {
        this.onSelectZone({ checked: isSelected }, element.zone_id);
      });
    this.coordinates = { ...this.coordinates };
  }

  selectParkingZoneOnMap(zone) {
    this.onSelectZone({ checked: zone.isSelected }, zone.zone_id);
  }
}
