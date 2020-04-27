import { Component, Input, Output, EventEmitter,  OnInit, OnChanges, ViewChild, SimpleChanges } from '@angular/core';

import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet.markercluster';
import 'leaflet-toolbar';
import 'leaflet-distortableimage';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import MapOptions from '../../classes/MapOptions';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-mapview-new',
  templateUrl: './mapview-new.component.html',
  styleUrls: ['./mapview-new.component.css']
})
export class MapviewNewComponent implements OnInit, OnChanges {

  private provider = new OpenStreetMapProvider();
  private map: L.Map;

  @Input() private options: MapOptions;
  @Input() mapDataJSON: string;
  @Input() mapDrawDataJSON: string;
  @Input() mapImgOverlayJSON: string;

  private mapDataGeoJSON: L.GeoJSON = L.geoJSON();
  private mapItems: L.FeatureGroup;
  private mapDrawDataGeoJSON: L.GeoJSON = L.geoJSON();
  private drawItems: L.FeatureGroup;

  private imgOverlayGeoJSON: L.GeoJSON = L.geoJSON();
  // TODO: add type definition L.DistortableImageOverlay
  private imgOverlay: L.ImageOverlay;

  @Input() mapCenter: any;
  @Input() isForceCenter = false;
  @Input() showClusterView = true;
  @Input() zoomValue = 12;

  @Output() mapDataChangedEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() mapDataEditEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() mapOverlayDataEmitter: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('mapDiv') mapContainer;

  private baseMaps = {
    OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),
    Esri: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    }),
    CartoDB: L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    })
  };

  drawControl: L.Control.Draw;
  public baseURL = environment.baseAssetsUrl;

  constructor() {}

  ngOnInit() {
    this.configureMap();
    this.handleEvents();
    this.displayMapData();
    this.displayMapDrawData();
    this.displayImgOverlayData();

    this.updateMapCenter();

    setTimeout(() => {
      this.map.invalidateSize();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.mapCenter || this.isForceCenter) {
      this.updateMapCenter();
    }

    if (changes.options) {
      this.updateMapOptions(this.options);
    }

    if (changes.mapDataJSON && this.mapDataJSON) {
      const geoJsonData = JSON.parse(this.mapDataJSON);
      this.mapDataGeoJSON = L.geoJSON(geoJsonData, {
        coordsToLatLng: function (coords) {
            return new L.LatLng(coords[0], coords[1], coords[2]);
        }
      });
      this.clearMap();
      this.displayMapData();
    }

    if (changes.mapDrawDataJSON) {
      if (this.mapDrawDataJSON) {
        const geoJsonData = JSON.parse(this.mapDrawDataJSON);
        this.mapDrawDataGeoJSON = L.geoJSON(geoJsonData, {
          coordsToLatLng: function (coords) {
            return new L.LatLng(coords[0], coords[1], coords[2]);
          }
        });
      } else {
        this.mapDrawDataGeoJSON = null;
      }
      this.clearMapDrawData();
      this.displayMapDrawData();
    }

    if (changes.mapImgOverlayJSON) {
      if (this.mapImgOverlayJSON) {
        const geoJsonData = JSON.parse(this.mapImgOverlayJSON);
        this.imgOverlayGeoJSON = L.geoJSON(geoJsonData, {
          coordsToLatLng: function (coords) {
            return new L.LatLng(coords[0], coords[1], coords[2]);
          }
        });
      } else {
        this.imgOverlayGeoJSON = null;
      }
      if (this.map) {
        this.clearImgOverlayData();
        this.displayImgOverlayData();
      }
    }
  }

  private updateMapCenter() {
    if (this.map && this.mapCenter) {
      this.map.setView(
        new L.LatLng(this.mapCenter[0], this.mapCenter[1]),
        this.zoomValue,
        { animate: true }
      );
    }
  }

  private addDrawControl(options: MapOptions) {
    if (options && options.editing) {
      if (this.drawControl) {
        this.map.removeControl(this.drawControl);
      }
      // Initialise the draw control and pass it the FeatureGroup of editable layers
      const drawOptions = {
        polyline: false,
        rectangle: false,
        circlemarker: false,
        polygon: options.polygon,
        circle: options.circle,
        marker: options.marker
      };

      this.drawControl = new L.Control.Draw({
        edit: {
          featureGroup: this.drawItems
        },
        draw: ( drawOptions as L.Control.DrawOptions )
      });

      this.map.addControl(this.drawControl);
    }
  }

  private addSearchControl(options: MapOptions) {
    if (options && options.search_bar) {
      const searchControl = new GeoSearchControl({
        provider: this.provider,                            // required
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
        autoClose: true,                                    // optional: true|false  - default false
        searchLabel: 'Enter address',                       // optional: string      - default 'Enter address'
        keepResult: false                                   // optional: true|false  - default false
      });

      this.map.addControl(searchControl);
    }
  }

  private configureMap() {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      center: L.latLng(this.options.centerLocation.lat, this.options.centerLocation.lng),
      zoom: this.zoomValue,
      minZoom: 4,
      maxZoom: 18,
      layers: [this.baseMaps.Esri]
    });

    this.drawItems = new L.FeatureGroup().setZIndex(10);
    this.mapItems = this.showClusterView ? new L.MarkerClusterGroup() : new L.FeatureGroup();
    this.map.addLayer(this.drawItems);
    this.map.addLayer(this.mapItems);

    L.control.zoom({ position: 'topright' }).addTo(this.map);
    L.control.layers(this.baseMaps).addTo(this.map);
    L.control.scale().addTo(this.map);

    this.addDrawControl(this.options);
    this.addSearchControl(this.options);

    this.addToggleClusterViewControl();
  }

  private updateMapOptions(options: MapOptions) {
    if (this.map) {
      this.map.options.center = L.latLng(options.centerLocation.lat, options.centerLocation.lng);
      this.map.options.zoom = this.zoomValue;
      this.map.options.minZoom = 4;
      this.map.options.maxZoom = 18;

      this.addDrawControl(options);
    }
  }

  private addToggleClusterViewControl() {
    const that = this;
    const ClusterViewControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function (map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.innerText = that.showClusterView ? 'All' : 'Clustering';
        container.title = that.showClusterView ? 'Display all' : 'Display clustering';

        container.onclick = function() {
          that.showClusterView = !that.showClusterView;
          container.innerText = that.showClusterView ? 'All' : 'Clustering';
          container.title = that.showClusterView ? 'Display all' : 'Display clustering';

          setTimeout(() => {
            that.clearMap();
            that.map.removeLayer(that.mapItems);
            that.mapItems = that.showClusterView ? new L.MarkerClusterGroup() : new L.FeatureGroup();
            that.map.addLayer(that.mapItems);
            that.displayMapData();
          });
        };
        return container;
      },
    });
    this.map.addControl(new ClusterViewControl());
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
        this.mapDrawDataGeoJSON = L.geoJSON(layersGeoJson, {
          coordsToLatLng: function (coords) {
              //                    latitude , longitude, altitude
              // return new L.LatLng(coords[1], coords[0], coords[2]); Normal behavior
              return new L.LatLng(coords[0], coords[1], coords[2]);
          }
        });
        // Save drawings to DB
        const mapdataJson = JSON.stringify(this.mapDrawDataGeoJSON.toGeoJSON());
        this.mapDataChanged(mapdataJson);
      }
    });

    this.map.on('draw:deleted', (e) => {
      const layers = (e as L.DrawEvents.Deleted).layers;
      layers.getLayers().forEach(layer => {
        this.drawItems.removeLayer(layer);
      });
      const layersGeoJson = this.drawItems.toGeoJSON();
      this.mapDrawDataGeoJSON = L.geoJSON(layersGeoJson, {
        coordsToLatLng: function (coords) {
            //                    latitude , longitude, altitude
            // return new L.LatLng(coords[1], coords[0], coords[2]); Normal behavior
            return new L.LatLng(coords[0], coords[1], coords[2]);
        }
      });


      // Save drawings to DB
      const mapdataJson = JSON.stringify(this.mapDrawDataGeoJSON.toGeoJSON());
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
      this.mapDrawDataGeoJSON = L.geoJSON(layersGeoJson, {
        coordsToLatLng: function (coords) {
            //                    latitude , longitude, altitude
            // return new L.LatLng(coords[1], coords[0], coords[2]); Normal behavior
            return new L.LatLng(coords[0], coords[1], coords[2]);
        }
      });
      // Save drawings to DB
      const mapdataJson = JSON.stringify(this.mapDrawDataGeoJSON.toGeoJSON());
      this.mapDataChanged(mapdataJson);
    });

    this.map.on('mouseout', (e) => {
      if (this.imgOverlay) {
        // @ts-ignore
        const corners = this.imgOverlay.getCorners();
        this.mapOverlayDataEmitter.emit({ type: 'mouseout', corners: corners });

        // @ts-ignore
        if (this.imgOverlay.editing.getMode() !== 'lock') {
          // @ts-ignore
          this.imgOverlay.editing.setMode('lock');
        }
      }
    });
  }

  private addOverlayListener = (e) => this.mapOverlayDataEmitter.emit({ type: 'added' });
  private removeOverlayListener = (e) => this.mapOverlayDataEmitter.emit({ type: 'removed' });

  private setOverlayEventHandlers(overlay: L.Layer) {
    if (overlay) {
      overlay.on('add', this.addOverlayListener);
      overlay.on('remove', this.removeOverlayListener);
    }
  }

  private removeOverlayEventHandlers(overlay: L.Layer) {
    if (overlay) {
      overlay.off('add', this.addOverlayListener);
      overlay.off('remove', this.removeOverlayListener);
    }
  }

  private displayMapDrawData() {
    if (this.mapDrawDataGeoJSON && this.drawItems) {
      this.mapDrawDataGeoJSON.eachLayer((layer: any) => {
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

  private displayImgOverlayData() {
    if (this.imgOverlayGeoJSON) {
      this.imgOverlayGeoJSON.eachLayer((layer: any) => {
        if (layer &&
          layer.options &&
          layer.feature &&
          layer.feature.properties &&
          layer.feature.properties.options) {
          layer.options = Object.assign(layer.options, layer.feature.properties.options);
        }

        if (layer.feature.properties.options.levelDraw) {
          const drawData = layer.feature.properties.options.levelDraw;

          const imgUrl = drawData.imgUrl && drawData.imgUrl.startsWith('data:image/')
            ? drawData.imgUrl
            : this.baseURL + drawData.imgUrl;

          let corners = drawData.corners;
          if (corners && corners.length) {
            corners = corners.slice(0, 4).map(latlng => L.latLng(latlng[0], latlng[1]));
          } else {
            corners = [];
          }

          // Note: Leaflet svg's z-index: 200; ImageOverlay should be placed on top - zIndex: 300
          // @ts-ignore
          this.imgOverlay = L.distortableImageOverlay(imgUrl, {
            // Note: modes: 'lock', 'drag', 'scale', 'distort', 'rotate', 'freeRotate'
            mode: 'lock',
            corners: corners,
            selected: true,
            zIndex: 300,
            editable: drawData.editable,
            // @ts-ignore
            actions: [L.LockAction, L.FreeRotateAction,  L.OpacityAction, L.DistortAction,  L.BorderAction, L.ExportAction, L.DeleteAction],
          })
            .addTo(this.map);
          this.imgOverlay.setOpacity(.6);

          this.setOverlayEventHandlers(this.imgOverlay);
          this.mapOverlayDataEmitter.emit({type: 'added'});
        }
      });
    }
  }

  private displayMapData() {
    // Display all drawings passed to this mapview.
    if (this.mapDataGeoJSON && this.mapItems) {
      this.mapDataGeoJSON.eachLayer((layer: any) => {
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
            // here we call all the info of the zone
            info += '<b style="color: #023b41;">' + key + '</b>: ' + layer.feature.properties.info[key] + '<br>';
            }
          });
          layer.bindPopup(info);
          if (layer.feature.properties.editable) {
            layer.on('popupopen', (e: any) => {
              setTimeout(() => {
                this.mapDataEditEmitter.emit(layer.feature.properties.value);
              }, 100);
            });
          }
        }

        this.mapItems.addLayer(layer);
      });
    }
  }

  private clearMap() {
    if (this.mapItems) {
      if (this.mapDataGeoJSON && this.mapItems) {
        this.mapDataGeoJSON.eachLayer((layer: any) => {
          if (layer.feature.properties.editable) {
            layer.off('popupopen');
          }
        });
      }
      this.mapItems.clearLayers();
    }
  }

  private clearMapDrawData() {
    if (this.drawItems) {
      this.drawItems.clearLayers();
    }
  }

  private clearImgOverlayData() {
    if (this.imgOverlay) {
      this.removeOverlayEventHandlers(this.imgOverlay);
      this.map.removeLayer(this.imgOverlay);
      this.imgOverlay = null;
    }
  }

  // Pass drawings to parent component of this mapview.
  public mapDataChanged(mapdata: any) {
    this.mapDataChangedEmitter.emit(mapdata);
  }
}

