import 'leaflet-draw';
import * as L from 'leaflet';
import MapOptions from '../../shared/classes/MapOptions';
import { Component, Input, Output, EventEmitter,  OnInit, OnChanges, ViewChild, SimpleChanges } from '@angular/core';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { Job } from '../../shared/classes/job';
import { Contravention } from '../../shared/classes/contravention';
import { Project } from '../../shared/classes/project';

@Component({
  selector: 'app-mapview',
  templateUrl: './mapview.component.html',
  styleUrls: ['./mapview.component.css']
})

export class MapviewComponent implements OnInit, OnChanges {
  private provider = new OpenStreetMapProvider();

  @Input() private options: MapOptions;
  @Input() mapdata: string;
  @Input() markerIconsPath: string;
  @Input() jobType: any;
  @Input() jobStatus: string;
  @Input() contraventionStatus: string;
  @Input() projectType: boolean = false;
  @Input() mapCenter: any;
  @Input() isForceCenter: boolean = true;
  @Input() showTimezone: boolean = false;
  @Input() count: number;

  @Output() mapDataChangedEmitter: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('mapDiv') mapContainer;

  private mapDataObj: L.GeoJSON;
  private map: L.Map;
  private drawItems: L.FeatureGroup;
  private mapTimezoneDataObj: L.GeoJSON;
  private drawTimezoneItems: L.FeatureGroup;

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

  constructor() {}

  ngOnInit() {
    this.configureMap();
    this.handleEvents();
    this.displayDrawings();
    this.updateMapCenter();
  }

  updateMapCenter() {
    if(this.map && this.mapCenter) this.map.panTo(new L.LatLng(this.mapCenter[0], this.mapCenter[1]));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.mapCenter || this.isForceCenter) {
      this.updateMapCenter();
    }

    if (this.mapdata) {
      const geoJsonData = JSON.parse(this.mapdata);
      this.mapDataObj = L.geoJSON(geoJsonData, {
        coordsToLatLng: function (coords) {
           //                  latitude , longitude, altitude
            return new L.LatLng(coords[0], coords[1], coords[2]);
        }
      });

    } else {
      this.mapDataObj = L.geoJSON();
    }

    this.clearMap();
    this.displayDrawings();

    // To avoid the problem of the map that doesn't appears correctly
    if (this.map) {
      this.map.invalidateSize(false);
    }
  }

  configureMap() {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      center: L.latLng(this.options.centerLocation.lat, this.options.centerLocation.lng),
      zoom: 12,
      minZoom: 4,
      maxZoom: 18,
      layers: [this.baseMaps.Esri]
    });

    this.drawItems = new L.FeatureGroup();
    // Initialise the draw control and pass it the FeatureGroup of editable layers
    const drawOptions = {
      polyline: false,
      rectangle: false,
      circlemarker: false,
      polygon: this.options.polygon,
      circle: this.options.circle,
      marker: this.options.marker
    };

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawItems
      },
      draw: ( drawOptions as L.Control.DrawOptions )
    });

    L.control.zoom({ position: 'topright' }).addTo(this.map);
    L.control.layers(this.baseMaps).addTo(this.map);
    L.control.scale().addTo(this.map);

    this.map.addLayer(this.drawItems);

    this.drawTimezoneItems = new L.FeatureGroup();
    this.map.addLayer(this.drawTimezoneItems);

    if (this.options.editing) {
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

  handleEvents() {
    this.map.on(L.Draw.Event.CREATED, (e) => {
      let ableToAddLayer = true;

      // Use this to avoid typescript type checking.
      const layer: any = (e as L.DrawEvents.Created).layer;
      const type = (e as L.DrawEvents.Created).layerType;

      let feature = layer.feature || {};
      feature.type = "Feature";
      feature.properties = feature.properties || {};

      feature.properties.options = feature.properties.options || {};
      feature.properties.options = Object.assign(feature.properties.options, layer.options);

      // Create a job marker.
      if (type === 'marker' && this.jobType) {
        feature.properties["jobType"] = this.jobType;
        feature.properties["jobStatus"] = this.jobStatus;
        feature.properties["markerIconsPath"] = this.markerIconsPath;

        if(this.drawItems.getLayers().length > 0) ableToAddLayer = false;
      }

      if(type === 'marker' && this.projectType) {
        feature.properties["projectType"] = true;
        if(this.drawItems.getLayers().length > 0) ableToAddLayer = false;
      }

      if (ableToAddLayer) {
        this.drawItems.addLayer(layer);
        const layersGeoJson = this.drawItems.toGeoJSON();
        this.mapDataObj = L.geoJSON(layersGeoJson, {
          coordsToLatLng: function (coords) {
              //                    latitude , longitude, altitude
              return new L.LatLng(coords[0], coords[1], coords[2]);
          }
        });

        // Save drawings to DB
        const mapdataJson = JSON.stringify(this.mapDataObj.toGeoJSON());
        this.updateMapData(mapdataJson);
      }
    });

    this.map.on('draw:deleted', (e) => {
      const layers = (e as L.DrawEvents.Deleted).layers;
      layers.getLayers().forEach(layer => {
        this.drawItems.removeLayer(layer);
      });
      const layersGeoJson = this.drawItems.toGeoJSON();
      this.mapDataObj = L.geoJSON(layersGeoJson, {
        coordsToLatLng: function (coords) {
            //                    latitude , longitude, altitude
            return new L.LatLng(coords[0], coords[1], coords[2]);
        }
      });
      // Save drawings to DB
      const mapdataJson = JSON.stringify(this.mapDataObj.toGeoJSON());
      this.updateMapData(mapdataJson);
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
      this.mapDataObj = L.geoJSON(layersGeoJson, {
        coordsToLatLng: function (coords) {
            //                    latitude , longitude, altitude
            return new L.LatLng(coords[0], coords[1], coords[2]);
        }
      });
      // Save drawings to DB
      const mapdataJson = JSON.stringify(this.mapDataObj.toGeoJSON());
      this.updateMapData(mapdataJson);
    });
  }

  displayDrawings() {

    // Display all drawings passed to this mapview.
    if (this.mapDataObj && this.drawItems) {
      this.mapDataObj.eachLayer((layer:any) => {
        if(layer &&
          layer.options &&
          layer.feature &&
          layer.feature.properties &&
          layer.feature.properties.options)
          layer.options = Object.assign(layer.options, layer.feature.properties.options);

        if(layer instanceof L.Marker) {
          if(layer.feature.properties.jobType) {
            L.Icon.Default.imagePath = layer.feature.properties.markerIconsPath;
            layer.setIcon(Job.getJobIcon(layer.feature.properties.jobType,
              layer.feature.properties.jobStatus));
            layer.bindPopup('Popup content for job marker to be set here!');
            layer.on("dblclick", (event) => {
              window.open('https://www.google.com/', '_blank');
            });
          }

          if(layer.feature.properties.contraventionStatus) {
            console.log('mapVien->displayDrawing-> contraventionStaus ', layer.feature.properties.contraventionStatus);
            L.Icon.Default.imagePath = layer.feature.properties.markerIconsPath;
            layer.setIcon(Contravention.getContraventionIcon());
          }

          if(layer.feature.properties.userType) {
            L.Icon.Default.imagePath = (layer as L.Marker).feature.properties.markerIconsPath;
            layer.bindPopup('Popup content for user marker to be set here!');
          }

          if(layer.feature.properties.projectType) {
            L.Icon.Default.imagePath = (layer as L.Marker).feature.properties.markerIconsPath;
           (layer as L.Marker).setIcon(Project.getProjectCenterIcon());
            layer.bindPopup('Center Location');
          }

          if(layer.feature.properties.signageType) {
            let Icon = L.Icon.extend({
              options: layer.feature.properties.options.icon.options
            });
            (layer as L.Marker).setIcon(new Icon());
          }

        }
        this.drawItems.addLayer(layer);
      });
      // To avoid the problem of the map that doesn't appears correctly
      this.map.invalidateSize(true);
    }

    if (this.showTimezone && this.mapTimezoneDataObj && this.drawTimezoneItems) {
      this.mapTimezoneDataObj.eachLayer((layer:any) => {
        layer.bindPopup(layer.feature.properties.time_zone);
        this.drawTimezoneItems.addLayer(layer);
      });
    }
  }

  clearMap() {
    if (this.drawItems) {
      this.drawItems.clearLayers();
    }
  }

  // Pass drawings to parent component of this mapview.
  updateMapData(mapdata) {
    this.mapDataChangedEmitter.emit(mapdata);
  }
}