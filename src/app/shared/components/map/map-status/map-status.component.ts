import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ArcgisService } from '../../../../services/arcgis.service';
import { Contravention } from '../../../../services/performance.service';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-map-status',
  templateUrl: './map-status.component.html',
  styleUrls: ['../map.component.scss', './map-status.component.scss']
})
export class MapStatusComponent implements OnInit, OnDestroy {
  @ViewChild('mapView') private mapViewElementRef: ElementRef;

  map: __esri.Map;
  view: __esri.MapView;

  movementGraphicsLayer: __esri.GraphicsLayer;
  contraventionsGraphicsLayer: __esri.GraphicsLayer;

  untilDestroyed = new Subject<boolean>();

  changeCoordinatesSubscription: Subscription;

  constructor(
    private arcgisService: ArcgisService,
  ) {
  }

  _movement: { [key: string]: number[] };
  _contraventions: Contravention[];

  @Input() changeCoordinates: Subject<number[]>;

  get movement() {
    return this._movement;
  }

  @Input()
  set movement(value: { [key: string]: number[] }) {
    this._movement = value;

    if (value && Object.keys(value).length > 0 && this.view) {
      this.setupMovement(value);
      const key = Object.keys(value)[0];
      this.goto(value[key]);
    }
  }

  get contraventions() {
    return this._contraventions;
  }

  @Input()
  set contraventions(value: Contravention[]) {
    this._contraventions = value;
    if (value && value.length > 0 && this.view) {
      this.setupContraventions(value);
    }
  }

  @Output() loaded = new EventEmitter();

  private goto(point: number[]) {
    if (this.view) {
      this.view.goTo(point);
    }
  }

  setupMovement(paths: { [key: string]: number[] }) {
    const symbol = {
      type: 'simple-line',
      color: [226, 119, 40],
      width: 2,
    };

    this.movementGraphicsLayer.removeAll();

    // tslint:disable-next-line:forin
    for (const idx in paths) {
      const geometry = {
        type: 'polyline',
        paths: paths[idx],
      };

      this.movementGraphicsLayer.add(new this.arcgisService.GraphicConstructor({
        // @ts-ignore
        geometry,
        symbol,
      }));
    }
  }

  setupContraventions(value: Contravention[]) {
    const symbol = {
      type: 'simple-marker',
      color: [255, 90, 20],
    };

    const popupTemplate = {
      title: 'Contravention #{CNNumberOffline}',
      content: 'Creation: <b>{Creation}</b>.'
    };

    this.contraventionsGraphicsLayer.removeAll();
    this.contraventionsGraphicsLayer.addMany(value.map(c => {
      const geometry = {
        type: 'point',
        longitude: c.longitude,
        latitude: c.latitude,
      };

      const attributes = {
        CNNumberOffline: c.cn_number_offline,
        Creation: c.creation,
      };

      return new this.arcgisService.GraphicConstructor({
        // @ts-ignore
        geometry,
        symbol,
        attributes,
        popupTemplate,
      });
    }));
  }

  async ngOnInit() {
    [this.map, this.view] = await this.arcgisService.initMapView(this.mapViewElementRef, {
      basemap: 'streets-navigation-vector',
    });

    this.movementGraphicsLayer = new this.arcgisService.GraphicsLayerConstructor();
    this.map.add(this.movementGraphicsLayer);

    this.contraventionsGraphicsLayer = new this.arcgisService.GraphicsLayerConstructor();
    this.map.add(this.contraventionsGraphicsLayer);

    this.loaded.emit();

    this.changeCoordinatesSubscription = this.changeCoordinates
      .takeUntil(this.untilDestroyed)
      .subscribe(value => {
        this.goto(value);
      });

    if (this.movement && Object.keys(this.movement).length > 0) {
      this.setupMovement(this.movement);
      const key = Object.keys(this.movement)[0];
      this.goto(this.movement[key]);
    }

    if (this.contraventions && this.contraventions.length > 0) {
      this.setupContraventions(this.contraventions);
    }
  }

  ngOnDestroy() {
    if (this.view) {
      this.view.container = null;
    }

    this.untilDestroyed.next(true);
    this.untilDestroyed.complete();
  }
}
