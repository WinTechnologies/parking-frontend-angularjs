import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import MapOptions from '../../classes/MapOptions';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'app-map-cluster-view',
  templateUrl: './map-cluster-view.component.html',
  styleUrls: ['./map-cluster-view.component.scss']
})
export class MapClusterViewComponent implements OnInit, OnChanges {

  private provider = new OpenStreetMapProvider();

  @Input() options: MapOptions;
  @Input() clusterMapData: string;
  @Input() mapDrawData: string;
  @Input() mapCenter: any;
  @Input() isForceCenter = false;

  @Output() mapDataChangedEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() mapDataEditEmitter: EventEmitter<any> = new EventEmitter<any>();


  @ViewChild('mapDiv') mapContainer;

  private map: L.Map;
  private mapDrawDataObj: L.GeoJSON = L.geoJSON();
  private drawItems: L.FeatureGroup;
  private clusterGroups: any = {};
  private clusterMapDataObj: any = {};

  private baseMaps = {
    OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    Esri: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    }),
    CartoDB: L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    })
  };

  constructor() {}

  ngOnInit() {

    this.configureMap();
    this.handleEvents();

    this.configClusterGroups();
    this.displayClusterMapData();

    this.displayMapDrawData();

    this.updateMapCenter();

    setTimeout(() => {
      this.map.invalidateSize();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['mapCenter'] && !changes['mapCenter'].isFirstChange()) || this.isForceCenter) {
      this.updateMapCenter();
    }

    if (changes['clusterMapData'] && !changes['clusterMapData'].isFirstChange()) {
      this.clearClusterMap();
      this.configClusterGroups();
      this.clearMapDrawData();
      this.displayClusterMapData();
    }

    if (changes['mapDrawData'] && !changes['mapDrawData'].isFirstChange()) {
      if (this.mapDrawData) {
        const geoJsonData = JSON.parse(this.mapDrawData);
        this.mapDrawDataObj = L.geoJSON(geoJsonData, {
          coordsToLatLng: function (coords) {
            return new L.LatLng(coords[0], coords[1], coords[2]);
          }
        });
      } else {
        this.mapDrawDataObj = null;
      }
      this.clearMapDrawData();
      this.displayMapDrawData();
    }
  }

  private updateMapCenter() {
    if (this.map && this.mapCenter) {
      this.map.panTo(new L.LatLng(this.mapCenter[0], this.mapCenter[1]));
    }
  }

  private configureMap() {

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      center: L.latLng(this.options.centerLocation.lat, this.options.centerLocation.lng),
      zoom: 12,
      minZoom: 4,
      maxZoom: 18,
      layers: [this.baseMaps.Esri]
    });

    const drawOptions = {
      polyline: false,
      rectangle: false,
      circlemarker: false,
      polygon: this.options.polygon,
      circle: this.options.circle,
      marker: this.options.marker
    };

    L.control.zoom({ position: 'topright' }).addTo(this.map);
    L.control.layers(this.baseMaps).addTo(this.map);
    L.control.scale().addTo(this.map);

    this.drawItems = new L.FeatureGroup();
    this.map.addLayer(this.drawItems);

    if (this.options.editing) {
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: this.drawItems
        },
        draw: ( drawOptions as L.Control.DrawOptions )
      });

      this.map.addControl(drawControl);
    }

    if (this.options.search_bar) {
      const searchControl = new GeoSearchControl({
        provider: this.provider,                               // required
        showMarker: true,                                   // optional: true|false  - default true
        showPopup: false,                                   // optional: true|false  - default false
        marker: {                                           // optional: L.Marker    - default L.Icon.Default
          icon: new L.Icon.Default(),
          draggable: false,
        },
        popupFormat: ({ query, result }) => result.label,   // optional: function    - default returns result label
        maxMarkers: 1,                                      // optional: number      - default 1
        retainZoomLevel: false,                             // optional: true|false  - default false
        animateZoom: true,                                  // optional: true|false  - default true
        autoClose: true,                                   // optional: true|false  - default false
        searchLabel: 'Enter address',                       // optional: string      - default 'Enter address'
        keepResult: false                                   // optional: true|false  - default false
      });

      this.map.addControl(searchControl);
    }
  }

  private configClusterGroups() {
    if (this.clusterMapData) {
      Object.keys(JSON.parse(this.clusterMapData)).forEach(groupName => {
        this.clusterGroups[groupName] = L.markerClusterGroup();
        this.map.addLayer(this.clusterGroups[groupName]);
      });
    }
  }

  private handleEvents() {
    this.map.on(L.Draw.Event.CREATED, (e) => {

      // Use this to avoid typescript type checking.
      const layer: any = (e as L.DrawEvents.Created).layer;

      const feature = layer.feature = layer.feature || {};
      feature.type = 'Feature';
      feature.properties = feature.properties || {};

      feature.properties.options = feature.properties.options || {};
      feature.properties.options = Object.assign(feature.properties.options, layer.options);

      if (this.drawItems.getLayers().length === 0) {
        this.drawItems.addLayer(layer);
        const layersGeoJson = this.drawItems.toGeoJSON();
        this.mapDrawDataObj = L.geoJSON(layersGeoJson, {
          coordsToLatLng: function (coords) {
            //                    latitude , longitude, altitude
            // return new L.LatLng(coords[1], coords[0], coords[2]); //Normal behavior
            return new L.LatLng(coords[0], coords[1], coords[2]);
          }
        });
        // Save drawings to DB
        const mapdataJson = JSON.stringify(this.mapDrawDataObj.toGeoJSON());
        this.mapDataChanged(mapdataJson);
      }
    });

    this.map.on('draw:deleted', (e) => {
      const layers = (e as L.DrawEvents.Deleted).layers;
      layers.getLayers().forEach(layer => {
        this.drawItems.removeLayer(layer);
      });
      const layersGeoJson = this.drawItems.toGeoJSON();
      this.mapDrawDataObj = L.geoJSON(layersGeoJson, {
        coordsToLatLng: function (coords) {
          //                    latitude , longitude, altitude
          // return new L.LatLng(coords[1], coords[0], coords[2]); //Normal behavior
          return new L.LatLng(coords[0], coords[1], coords[2]);
        }
      });


      // Save drawings to DB
      const mapdataJson = JSON.stringify(this.mapDrawDataObj.toGeoJSON());
      this.mapDataChanged(mapdataJson);
    });

    this.map.on(L.Draw.Event.EDITED, (e) => {
      const editedLayers = (e as L.DrawEvents.Edited).layers;
      this.drawItems.getLayers().map(layer => {
        const originalLayerId = this.drawItems.getLayerId(layer);
        const editedLayer = editedLayers.getLayer(originalLayerId);
        if (editedLayer) {
          return editedLayer;
        } else {
          return layer;
        }
      });
      const layersGeoJson = this.drawItems.toGeoJSON();
      this.mapDrawDataObj = L.geoJSON(layersGeoJson, {
        coordsToLatLng: function (coords) {
          //                    latitude , longitude, altitude
          // return new L.LatLng(coords[1], coords[0], coords[2]); //Normal behavior
          return new L.LatLng(coords[0], coords[1], coords[2]);
        }
      });
      // Save drawings to DB
      const mapdataJson = JSON.stringify(this.mapDrawDataObj.toGeoJSON());
      this.mapDataChanged(mapdataJson);
    });
  }

  private displayMapDrawData() {
    if (this.mapDrawDataObj && this.drawItems) {
      this.mapDrawDataObj.eachLayer((layer: any) => {
        if (layer &&
          layer.options &&
          layer.feature &&
          layer.feature.properties &&
          layer.feature.properties.options) {
          layer.options = Object.assign(layer.options, layer.feature.properties.options);
        }

        if (layer.feature.properties.options.icon) {
          const Icon = L.Icon.extend({
            options: layer.feature.properties.options.icon.options
          });
          (layer as L.Marker).setIcon(new Icon());
        }
        this.drawItems.addLayer(layer);
      });
    }
  }

  private displayClusterMapData() {

    if (this.clusterMapData && this.clusterGroups) {
      const that = this;
      const clusterGroupData = JSON.parse(this.clusterMapData);
      Object.keys(clusterGroupData).forEach(groupName => {
        this.clusterMapDataObj[groupName] = L.geoJSON(clusterGroupData[groupName], {
          coordsToLatLng: function (coords) {
            return new L.LatLng(coords[0], coords[1], coords[2]);
          },
          onEachFeature(feature, layer) {
            if (layer &&
              layer['options'] &&
              feature &&
              feature.properties &&
              feature.properties.options) {
              layer['options'] = Object.assign(layer['options'], feature.properties.options);
            }
            if (feature.properties.options.icon) {
              const Icon = L.Icon.extend({
                options: feature.properties.options.icon.options
              });
              (layer as L.Marker).setIcon(new Icon());
            }

            if (feature.properties.info) {
              let info = '';
              Object.keys(feature.properties.info).forEach(key => {
                if (key !== 'connecting_points') {
                  feature.properties.info[key] = feature.properties.info[key] || '';
                  // here we call all the info of the zone
                  info += '<b style="color: #023b41;">' + key + '</b>: ' + feature.properties.info[key] + '<br>';
                }
              });
              layer.bindPopup(info);
              if (feature.properties.editable) {
                layer.on('popupopen', (e: any) => {
                  setTimeout(() => {
                    that.mapDataEditEmitter.emit(feature.properties.value);
                  }, 100);
                });
              }
            }
          }
        });

        this.clusterGroups[groupName].addLayer(this.clusterMapDataObj[groupName]);
      });
    }
  }

  private clearClusterMap() {
    if (this.clusterGroups) {
      Object.keys(this.clusterGroups).forEach(feature => {
        this.map.removeLayer(this.clusterGroups[feature]);
      });
    }
  }

  private clearMapDrawData() {
    if (this.drawItems) {
      this.drawItems.clearLayers();
    }
  }

  // Pass drawings to parent component of this mapview.
  public mapDataChanged(mapdata: any) {
    this.mapDataChangedEmitter.emit(mapdata);
  }

}
