import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import * as L from 'leaflet';

@Injectable()
export class MapService {

  private map: L.Map;
  private mapDataObj: L.GeoJSON;
  private drawItems: L.FeatureGroup;
  private provider = new OpenStreetMapProvider();

  constructor(private http: HttpClient) {

  }

  public getMap(): L.Map {
    return this.map;
  }

  public setMap(map: L.Map) {
    this.map = map;
  }

  public search (city: string): any {
    return this.provider.search({query: city});
  }

  configureMap(el, options): L.Map {
    const baseMaps = this.getBaseMaps();

    const map = L.map(el, {
      zoomControl: false,
      center: options.centerLocation,
      zoom: 12,
      minZoom: 4,
      maxZoom: 18,
      layers: [baseMaps.Esri]
    });

    const drawItems = new L.FeatureGroup();

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    const drawOptions = {
      polyline: false,
      rectangle: false,
      circlemarker: false,
      polygon: options.polygon,
      circle: options.circle,
      marker: options.marker
    };

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawItems
      },
      draw: drawOptions as L.Control.DrawOptions
    });

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.layers(baseMaps).addTo(map);
    L.control.scale().addTo(map);

    map.addLayer(drawItems);
    if (options.editing) {
      map.addControl(drawControl);
    }
    if (options.search_bar) {
      const searchControl = new GeoSearchControl({
        provider: this.provider, // required
        showMarker: true, // optional: true|false  - default true
        showPopup: false, // optional: true|false  - default false
        marker: {
          // optional: L.Marker    - default L.Icon.Default
          icon: new L.Icon.Default(),
          draggable: false
        },
        popupFormat: ({ query, result }) => result.label, // optional: function    - default returns result label
        maxMarkers: 1, // optional: number      - default 1
        retainZoomLevel: false, // optional: true|false  - default false
        animateZoom: true, // optional: true|false  - default true
        autoClose: true, // optional: true|false  - default false
        searchLabel: 'Enter address', // optional: string      - default 'Enter address'
        keepResult: false // optional: true|false  - default false
      });

      map.addControl(searchControl);
    }

    return map;
  }

  getBaseMaps() {
    return {
      OpenStreetMap: L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
      }),
      Esri: L.tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
        }
      ),
      CartoDB: L.tileLayer(
        'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        }
      )
    };
  }

  displayDrawings() {
    // Display all drawings passed to this mapview.
    if (this.mapDataObj && this.drawItems) {
      this.mapDataObj.eachLayer((layer: any) => {
        if (
          layer &&
          layer.options &&
          layer.feature &&
          layer.feature.properties &&
          layer.feature.properties.options
        ) {
          layer.options = Object.assign(
            layer.options,
            layer.feature.properties.options
          );
        }


        if (layer instanceof L.Marker) {
          if (layer.feature.properties.jobType) {
            layer.bindPopup('Popup content for job marker to be set here!');

            layer.on('dblclick', event => {
              window.open('https://www.google.com/', '_blank');
            });
          }
        }
        if ((layer as L.Marker).feature.properties.userType) {
          layer.bindPopup('Popup content for user marker to be set here!');
        }
        this.drawItems.addLayer(layer);
      });
    }
  }

  clearLayers() {
    if (this.drawItems) {
      this.drawItems.clearLayers();
    }
  }

  getReadMarkerUps(): Promise<any> {
    const resourceUrls = {
        'enforcer': '/assets/Icons/Projects_section/Project list/eo_hover.svg',
        'driver': '/assets/Icons/Projects_section/Project list/driver.svg',
        'eod': '/assets/Icons/Projects_section/Project list/EOD_icon.svg',
        'parking': '/assets/project-setup/onstreet/parking.svg'
    };

    let resourceContents = {};
    let promiseList = [];
    Object.keys(resourceUrls).forEach( key => {
        promiseList.push(
            this.http.get(resourceUrls[key], {responseType: 'text'})
                .toPromise()
                .then( data => {
                    resourceContents[key] = data;
                }));
    });

    return Promise.all(promiseList).then( result => {
        return resourceContents;
    });
  }
}
