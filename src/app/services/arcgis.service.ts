import { ElementRef, Injectable } from '@angular/core';
import { loadModules } from 'esri-loader';

export interface InitMapViewParameters {
  basemap?: string;
  zoom?: number;
  center?: number[];
}

type InitMapResult = [__esri.Map, __esri.MapView];

@Injectable()
export class ArcgisService {
  loaded = false;

  MapConstructor: __esri.MapConstructor;
  MapViewConstructor: __esri.MapViewConstructor;

  GraphicsLayerConstructor: __esri.GraphicsLayerConstructor;
  GraphicConstructor: __esri.GraphicConstructor;

  public async load() {
    if (this.loaded) {
      return;
    }

    [
      this.MapConstructor,
      this.MapViewConstructor,
      this.GraphicsLayerConstructor,
      this.GraphicConstructor,
    ] = await loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/GraphicsLayer',
      'esri/Graphic',
    ]);

    this.loaded = true;
  }

  public async initMapView(element: ElementRef, params: InitMapViewParameters): Promise<InitMapResult> {
    await this.load();

    params = {
      basemap: 'streets-navigation-vector',
      zoom: 14,
      center: [2.349014, 48.864716], // Paris center
      ...params,
    };

    const map = new this.MapConstructor({
      basemap: params.basemap,
    });

    const view = new this.MapViewConstructor({
      container: element.nativeElement,
      map: map,
      zoom: params.zoom,
      center: params.center,
    });

    await view.when();

    return new Promise<InitMapResult>(resolve => {
      resolve([
        map,
        view,
      ]);
    });
  }
}
