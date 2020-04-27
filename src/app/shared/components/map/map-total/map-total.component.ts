import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ArcgisService } from '../../../../services/arcgis.service';

@Component({
  selector: 'app-map-total',
  templateUrl: './map-total.component.html',
  styleUrls: ['../map.component.scss', './map-total.component.scss']
})
export class MapTotalComponent implements OnInit, OnDestroy {
  @ViewChild('mapView') private mapViewElementRef: ElementRef;

  map: __esri.Map;
  view: __esri.MapView;

  movementGraphicsLayer: __esri.GraphicsLayer;
  contraventionsGraphicsLayer: __esri.GraphicsLayer;

  constructor(
    private arcgisService: ArcgisService,
  ) {
  }

  @Output() loaded = new EventEmitter();

  async ngOnInit() {
    [this.map, this.view] = await this.arcgisService.initMapView(this.mapViewElementRef, {
      basemap: 'streets-navigation-vector',
    });

    this.movementGraphicsLayer = new this.arcgisService.GraphicsLayerConstructor();
    this.map.add(this.movementGraphicsLayer);

    this.loaded.emit();
  }

  ngOnDestroy() {
    if (this.view) {
      this.view.container = null;
    }
  }
}
