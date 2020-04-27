import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterContentChecked } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-analytics-map-chart',
  templateUrl: './map-chart.component.html',
  styleUrls: ['./map-chart.component.css']
})

export class MapChartComponent implements OnInit, AfterContentChecked, OnDestroy {
  @Input() markers: Array<any>;
  @Input() typeOfMap = 'Esri';
  @ViewChild('mapDiv') mapContainer: ElementRef;

  private mymap;
  private baseMaps = {
    OpenStreetMap: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    Esri: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    CartoDB: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
  };

  constructor() { }
  ngOnInit() {
    this.initMap();
  }

  ngAfterContentChecked(): void {
    this.updateMap();
  }

  initMap() {
    this.markers = this.markers.filter(marker => marker.longitude !== '0');
    this.markers = this.markers.slice(0, 200);

    const tiles = L.tileLayer(this.typeOfMap ? this.baseMaps[this.typeOfMap] : this.baseMaps.Esri);

    let center = L.latLng(48.864716, 2.349014);
    if (this.markers[0] && this.markers[0]['latitude']) {
      center = L.latLng(this.markers[0]['latitude'], this.markers[0]['longitude']);
    }

    this.mymap = L.map(this.mapContainer.nativeElement, {
      center,
      zoom: 12,
      minZoom: 4,
      maxZoom: 18,
      layers: [tiles]
    });

    const defaultIcon = L.icon({
      iconUrl: './assets/marker-icon.svg',
      iconRetinaUrl: './assets/marker-icon.svg',
      iconSize: [48, 48],
      shadowSize: [48, 48]
    });

    if (this.markers.length > 0) {
      const clusterMarkers = L.markerClusterGroup();
      this.markers.forEach(el => clusterMarkers.addLayer(L.marker([+el['latitude'], +el['longitude']], {icon: defaultIcon})));
      this.mymap.addLayer(clusterMarkers);
    }
  }

  updateMap() {
    if (this.mymap && this.mymap.invalidateSize) {
      this.mymap.invalidateSize({ padding: [0, 0], maxZoom: 18 });
    }
  }

  ngOnDestroy(): void {
    this.mymap = null;
  }
}