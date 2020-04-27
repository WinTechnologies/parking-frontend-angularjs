import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';



@Component({
  selector: 'app-parking-map',
  templateUrl: './parking-map.component.html',
  styleUrls: ['./parking-map.component.css']
})
export class ParkingMapComponent implements OnInit {

  private provider = new OpenStreetMapProvider();

  @Input() set coordinates(value) {
    this._coordinates = value;
    this.initMap();
  }
  @Input() typeOfMap;
  @Output() selectParkingZoneOnMap = new EventEmitter();
  @ViewChild('parkingMap') mapContainer;

  private mymap;

  private baseMaps = {
    OpenStreetMap: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    Esri: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    CartoDB: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
  };

  selectedIcon = L.icon({
    iconUrl: './../../../../../../../assets/Icons/Violations/tariff-section/Parking_icon selected.svg',
    iconSize: [45, 65],
    iconAnchor: [22, 75],
    popupAnchor: [-3, -76]
  });
  basicIcon = L.icon({
    iconUrl: './../../../../../../../assets/Icons/Violations/tariff-section/Parking_icon.svg',
    iconSize: [45, 65],
    iconAnchor: [22, 73],
    popupAnchor: [-3, -76]
  });

  polygons;
  _coordinates;

  get coordinates() {
    return this._coordinates;
  }

  selectedColor = 'blue';
  unselectedColor = 'coral';


  constructor() { }

  ngOnInit() {
  }

  initMap() {
    if (this.coordinates && (this.coordinates.markers[0] || this.coordinates.polylines[0].coords)) {
      this.mymap = this.mymap ? this.mymap : L.map(this.mapContainer.nativeElement).setView(this.coordinates.polylines[0].coords[0], 13);
      this.coordinates.markers.forEach(el => {
        L.marker(el.coords, { icon: el.isSelected ? this.selectedIcon : this.basicIcon }).addTo(this.mymap);
      });
      if (this.coordinates.polylines) {
        this.coordinates.polylines.forEach(polyline => {
          if (polyline.coords) {
            const tooltip = '<span class="tooltip-label">Zone:</span> ' + polyline.zone_id
              + '<br /><span class="tooltip-label">Location: </span>' + polyline.zone_name;
            this.polygons = L.polygon(polyline.coords, { color: polyline.isSelected ? this.selectedColor : this.unselectedColor }).addTo(this.mymap).bindTooltip(tooltip);
            this.addSelectZoneHadler(this.polygons, polyline, tooltip);
          }
        });
      }
    } else {
      this.mymap = L.map(this.mapContainer.nativeElement).setView([48.864716, 2.349014], 13);
    }

    const searchControl = new GeoSearchControl({
      provider: this.provider,                               // required
      showMarker: false,                                   // optional: true|false  - default true
      autoClose: true,                                   // optional: true|false  - default false
    });

    this.mymap.addControl(searchControl);


    L.tileLayer(this.typeOfMap ? this.baseMaps[this.typeOfMap] : this.baseMaps.Esri, {
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'your.mapbox.access.token'
    }).addTo(this.mymap);
  }

  addSelectZoneHadler(polygon, polyline, tooltip) {
    polygon.on(
      'click',
      event => {
        polyline.isSelected = !polyline.isSelected;
        this.selectParkingZoneOnMap.emit({ zone_id: polyline.zone_id, isSelected: polyline.isSelected });
        this.mymap.removeLayer(polygon);
        polygon = L.polygon(polyline.coords, { color: polyline.isSelected ? this.selectedColor : this.unselectedColor }).addTo(this.mymap).bindTooltip(tooltip);
        this.addSelectZoneHadler(polygon, polyline, tooltip);
      });
  }
}
