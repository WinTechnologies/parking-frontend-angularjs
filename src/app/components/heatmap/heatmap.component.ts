import 'hammerjs/hammer';
import 'leaflet-draw';
import * as L from 'leaflet';
import * as moment from 'moment';
import * as HeatmapOverlay from 'leaflet-heatmap/leaflet-heatmap';
import MapOptions from '../../shared/classes/MapOptions';
import { HeatmapService } from '../../services/heatmap.service';
import { ToastrService } from 'ngx-toastr';
import { MapService } from '../../services/map.service';
import { IHeatmapPoint } from '../../shared/interfaces/heatmap-point.interface';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit, OnChanges, OnDestroy, ViewChild, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-heatmap',
    templateUrl: './heatmap.component.html',
    styleUrls: ['./heatmap.component.scss']
})

export class HeatmapComponent implements OnInit, OnChanges, OnDestroy {
    private heatpointSubscription: Subscription;

    heatmapLayer = null;
    timer;
    heatPoints: IHeatmapPoint[] = [];
    isPaused = true;
    sliderHour = 14;
    displayTime = '';

    @Input() date: Date;
    @Input() cities;
    @Input() submit: boolean;
    @Input() private options: MapOptions;
    @Input() mapdata: string;
    @Input() markerIconsPath: string;

    @ViewChild('mapDiv') mapContainer;

    private mapDataObj: L.GeoJSON;
    private map: L.Map;

    constructor(
        private heatmapService: HeatmapService,
        private toastrService: ToastrService,
        private mapService: MapService
    ) {
    }

    ngOnInit() {
        this.configureMap();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.mapdata) {
            const geoJsonData = JSON.parse(this.mapdata);
            this.mapDataObj = L.geoJSON(geoJsonData);
        } else {
            this.mapDataObj = L.geoJSON();
        }

        this.clearMap();
        if (changes.submit && changes.submit.currentValue) {
            this.resetData();
            this.getHeatPoints();
        }

        if (changes.cities && changes.cities.currentValue) {
            this.recenterMap();
        }
    }

    configureMap() {
        const cfg = {
            container: this.mapContainer.nativeElement,
            radius: 30,
            maxOpacity: .8,
            valueField: 'count',
            latField: 'lat',
            lngField: 'lng',
        };

        this.heatmapLayer = new HeatmapOverlay(cfg);
        this.options.centerLocation = L.latLng(this.cities[0].lat, this.cities[0].lng);
        this.map = this.mapService.configureMap(this.mapContainer.nativeElement, this.options);
        this.map.addLayer(this.heatmapLayer);
    }

    recenterMap() {
        if (this.map && this.cities && this.cities[0]) {
            this.map.setView(L.latLng(this.cities[0].lat, this.cities[0].lng), this.map.getZoom());
        }
    }

    getHeatPoints() {
        const cityProjectsIds = this.cities
            .map(city => city.project_ids)
            .reduce(function (a, b) {
                return a.concat(b);
            });

        this.heatpointSubscription = this.heatmapService
            .getAllByProjectIds(cityProjectsIds, this.date.toISOString())
            .subscribe((heatPoints: IHeatmapPoint[]) => {
                if (heatPoints.length === 0) {
                    this.toastrService.error('Data is not available for this day, please select another day', 'Error');
                } else {
                    this.heatPoints = heatPoints;
                    this.updateDisplay(this.sliderHour);
                }
            });
    }

    clearMap() {
        this.mapService.clearLayers();
    }

    addMapLayer(hour) {
        const points = this.getHourHeatPoints(hour);

        this.heatmapLayer.setData({
            max: 100,
            data: points
        });
    }

    getHourHeatPoints(hour = 0) {
        const points = [];

        if (hour !== undefined) {
            this.heatPoints.forEach((heatpoint) => {
                heatpoint.hours.forEach((pointHour) => {
                    if (+pointHour.hour === hour) {
                        points.push({
                            lat: parseFloat(heatpoint.lat),
                            lng: parseFloat(heatpoint.lng),
                            count: parseFloat(pointHour.intensity) * 100
                        });
                    }
                });
            });
        }
        return points;
    }

    togglePlay() {
        this.isPaused = !this.isPaused;
        this.resetSliderAnimation();
    }

    resetSliderAnimation() {
        if (!this.isPaused) {
            this.timer = setInterval(() => {
                this.sliderHour += 1;

                if (this.sliderHour >= 24) {
                    this.sliderHour = 1;
                }
                this.updateDisplay(this.sliderHour);
            }, 2000);
        } else {
            clearTimeout(this.timer);
        }
    }

    onSliderChanged() {
        const hour = this.sliderHour === 24 ? 0 : this.sliderHour;

        this.updateDisplay(hour);
    }

    updateDisplay(hour) {
        this.addMapLayer(hour);
        this.displayTime = `${this.sliderHour}:00 ${moment(this.date).format('dddd, Do of MMMM YYYY')}`;
    }

    resetData(isHard = false) {
        clearTimeout(this.timer);
        this.heatPoints = [];
        this.isPaused = true;
        if (this.heatmapLayer && isHard) {
            this.map.removeLayer(this.heatmapLayer);
            this.heatmapLayer = null;
        }
        this.resetSliderAnimation();
    }

    ngOnDestroy() {
        if (this.heatpointSubscription) {
            this.heatpointSubscription.unsubscribe();
        }
    }
}