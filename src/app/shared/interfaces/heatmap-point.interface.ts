import { IHeatmapPointHour } from './heatmap-point-hour.interface';

export class IHeatmapPoint {
  code_id: string;
  weekday: number;
  date: string;
  lat: string;
  lng: string;
  hours: IHeatmapPointHour[];
}
