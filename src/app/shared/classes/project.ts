import * as L from 'leaflet';

let ProjectCenterIcon = L.Icon.extend({
  options: {
    // shadowUrl: '/assets/marker-shadow.png',
    iconUrl: '/assets/marker-icon.svg',
    iconRetinaUrl: '/assets/marker-icon.svg',
    iconSize: [48, 48],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [48, 48]
  }
});

export class Project {
  id: number;
  name: string;
  currency_code?: string;
  currency_name?: string;
  sites: any[];
  project_team: any[];
  end_date: string;
  start_date: string;
  contract_pdf: string;
  project_images: string[];
  center_latitude: number;
  center_longitude: number;
  
  constructor() {
    this.sites = [];
    this.project_team = [];
  }


  static getProjectCenterIcon() {
    return new ProjectCenterIcon();
  }
}
