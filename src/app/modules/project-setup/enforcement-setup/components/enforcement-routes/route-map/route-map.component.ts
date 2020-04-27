import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import 'leaflet-routing-machine';
import 'lrm-graphhopper';
import 'leaflet-control-geocoder';

import {GeoSearchControl, OpenStreetMapProvider} from 'leaflet-geosearch';

declare let L;

@Component({
  selector: 'app-route-map',
  templateUrl: './route-map.component.html',
  styleUrls: ['./route-map.component.scss']
})
export class RouteMapComponent implements OnInit, OnChanges {
  @Input() mapdata: string;
  @Input() mapCenter: any;
  @Input() waypoints: any[];
  @Input() showClusterView = false;

  @Output() mapRoutesChangedEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() mapRouteEditEmitter: EventEmitter<any> = new EventEmitter<any>();

  private baseMaps = {
    OpenStreetMap: L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
    }),
    Esri: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    }),
    CartoDB: L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    })
  };

  private map: any;
  private mapItems: L.FeatureGroup;
  private drawItems: L.FeatureGroup;
  private mapDataObj: L.GeoJSON = L.geoJSON();
  private routingControl: any;
  private removeRouting: any;
  private provider = new OpenStreetMapProvider();

  constructor() { }

  ngOnInit() {
    this.configure();
  }

  ngOnChanges( changes: SimpleChanges ) {
    if (changes.mapCenter) {
      this.updateMapCenter();
    }
    if (changes.mapdata && this.mapdata) {
      const geoJsonData = JSON.parse(this.mapdata);
      this.mapDataObj = L.geoJSON(geoJsonData, {
        coordsToLatLng: function (coords) {
            return new L.LatLng(coords[0], coords[1], coords[2]);
        }
      });
      this.clearMap();
      this.displayDrawings();
    }

    if (changes.waypoints && this.waypoints) {
      if (this.waypoints.length === 0) {
        this.routingControl.spliceWaypoints(0, this.routingControl.getWaypoints().length);
      } else {
        const waypoints = this.waypoints.map(v => {
          return v.latLng;
        });
        this.routingControl.setWaypoints(waypoints);
      }
    }
  }

  private configure() {
    this.map = L.map('mapRoute', {
      center: L.latLng(this.mapCenter.lat, this.mapCenter.lng),
      zoomControl: false,
      zoom: 12,
      minZoom: 4,
      maxZoom: 18,
      layers: [this.baseMaps.Esri]
    });

    L.control.layers(this.baseMaps).addTo(this.map);

    this.drawItems = new L.FeatureGroup;

    // draw control
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawItems
      },
      draw: ({
        polyline: false,
        rectangle: false,
        circlemarker: false,
        polygon: false,
        circle: false,
        marker: true
      })
    });

    this.map.addControl(drawControl);

    // search control
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
    // draw layer
    this.mapItems = this.showClusterView ? new L.MarkerClusterGroup() : new L.FeatureGroup();
    this.map.addLayer(this.mapItems);

    // routing control
    this.routingControl = L.Routing.control({
        waypoints: [],
        createMarker: function(i, wp, nWps) {
          const routeMarker = L.icon({
            // shadowUrl: '/assets/marker-shadow.png',
            iconUrl: '/assets/marker-icon.svg',
            iconRetinaUrl: '/assets/marker-icon.svg',
            iconSize: [42, 42],
            iconAnchor: [21, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [42, 42]
          });
          return L.marker(wp.latLng, {zIndexOffset: 2000, draggable: true, icon: routeMarker});
        },
        routeWhileDragging: true,
        fitSelectedRoutes: false,
        geocoder: L.Control.Geocoder.nominatim(),
        router: L.Routing.graphHopper('b1770ee1-63d1-4812-92fd-8a8df4140f90',
        {
          urlParameters: {
              vehicle: 'foot'
          }
        }  )
    })
    .on('routesfound', (e: any) => {
      this.routesFound(e);
    }).addTo(this.map);

    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      const type = e.layerType,
          layer = e.layer;
      this.drawItems.addLayer(layer);
      if (type === 'marker') {
        if (this.routingControl.getWaypoints().length === 2) {
          const wayPoints = this.routingControl.getWaypoints();
          if (wayPoints[0].latLng == null) {
            this.routingControl.spliceWaypoints(0, 1, layer._latlng);
          } else if (wayPoints[1].latLng == null) {
            this.routingControl.spliceWaypoints(1, 1, layer._latlng);
          } else {
            this.routingControl.spliceWaypoints(this.routingControl.getWaypoints().length, 0, layer._latlng);
          }
        } else {
          this.routingControl.spliceWaypoints(this.routingControl.getWaypoints().length, 0, layer._latlng);
        }
      }
    });

    this.map.on('draw:deleted', (e: any) => {
      const type = e.layerType;
      const layers = e.layers;
      if (type === 'marker') {
        layers.getLayers().forEach(layer => {
          this.drawItems.removeLayer(layer);
        });
        const layersGeoJson = this.drawItems.toGeoJSON();
        this.mapDataObj = L.geoJSON(layersGeoJson, {
          coordsToLatLng: function (coords) {
            //                    latitude , longitude, altitude
            // return new L.LatLng(coords[1], coords[0], coords[2]); Normal behavior
            return new L.LatLng(coords[0], coords[1], coords[2]);
          }
        });


        // Save drawings to DB
        const mapdataJson = JSON.stringify(this.mapDataObj.toGeoJSON());
        // this.mapDataChanged(mapdataJson);
      }
    });

    this.map.on(L.Draw.Event.EDITED, (e: any) => {
      const editedLayers = e.layers;
      const type = e.layerType;
      if (type === 'marker') {
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
        this.mapDataObj = L.geoJSON(layersGeoJson, {
          coordsToLatLng: function (coords) {
            //                    latitude , longitude, altitude
            // return new L.LatLng(coords[1], coords[0], coords[2]); Normal behavior
            return new L.LatLng(coords[0], coords[1], coords[2]);
          }
        });
        // Save drawings to DB
        const mapdataJson = JSON.stringify(this.mapDataObj.toGeoJSON());
        // this.mapDataChanged(mapdataJson);
      }
    });
  }

  private updateMapCenter() {
    if (this.map && this.mapCenter) {
      this.map.panTo(new L.LatLng(this.mapCenter.lat, this.mapCenter.lng));
    }
  }

  private routesFound(routes: any) {
    this.mapRoutesChangedEmitter.emit(routes);
  }

  clearMap() {
    if (this.mapItems) {
      this.mapItems.clearLayers();
    }
  }

  displayDrawings() {

    // Display all drawings passed to this mapView.

    if (this.mapDataObj && this.mapItems) {
      this.mapDataObj.eachLayer((layer: any) => {
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

        if (layer.feature.properties.info) {
          let info = '';
          Object.keys(layer.feature.properties.info).forEach(key => {
            if (key !== 'connecting_points') {
              layer.feature.properties.info[key] = layer.feature.properties.info[key] || '';
              info += '<b style="color: #023b41;">' + key + '</b>: ' + layer.feature.properties.info[key] + '<br>';
            }
          });
          layer.bindPopup(info);
          if (layer.feature.properties.editable) {
            layer.on('click', (e: any) => {
              setTimeout(() => {
                this.mapRouteEditEmitter.emit(layer.feature.properties.value);
              }, 100);
            });
          }
        }
        this.mapItems.addLayer(layer);
      });
    }
  }
}
