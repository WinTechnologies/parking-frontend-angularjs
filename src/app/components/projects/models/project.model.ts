import * as L from 'leaflet';

const ProjectCenterIcon = L.Icon.extend({
  options: {
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
  id: any;
  project_id: string;
  project_name: string;
  type_establishment: string;
  img_url: string;
  created_at: any;
  center_latitude: number;
  center_longitude: number;
  currency_code: string;
  start_date: string;
  end_date: string;
  project_code: string;
  project_location: string;
  gmt: string;
  documents: string;
  notes: string;
  vat_id: number;
  vat_code?: string;
  country_code: string;
  country_name: string;
  city_name: string;

  has_on_street?: boolean;
  has_car_park?: boolean;
  has_enforcement?: boolean;
  has_taxi_management?: boolean;
  has_valet_parking?: boolean;
  has_rental_car?: boolean;
  parking_spaces?: number;

  public isNotEqual(other: Project): boolean {
    const findItem = Object.keys(this).find(field => {
      if (this[field] !== other[field] && field !== 'created_at') {
        return true;
      } else {
        return false;
      }
    });

    return findItem ? true : false;
  }

  static getProjectCenterIcon() {
    return new ProjectCenterIcon();
  }
}

export enum ProjectActivityType {
  Street = 0,
  CarPark,
  Enforcement,
  TaxiManagement,
  ValetParking,
  RentalCar
}

export class ProjectActivityItem {
  name: string;
  type: ProjectActivityType;
  icon: string;
  selected: boolean;
  featureName?: string;
}

export const globalProjectActivities: ProjectActivityItem[] = [
  { name: 'On Street', type: ProjectActivityType.Street, icon: 'assets/Icons/Projects_section/on_street.svg', selected: false, featureName: 'has_on_street' },
  { name: 'Car Park', type: ProjectActivityType.CarPark, icon: 'assets/Icons/Projects_section/car_park.svg', selected: false, featureName: 'has_car_park'  },
  { name: 'Enforcement', type: ProjectActivityType.Enforcement, icon: 'assets/Icons/Projects_section/enforcement.svg', selected: false, featureName: 'has_enforcement'  },
  { name: 'Taxi Management', type: ProjectActivityType.TaxiManagement, icon: 'assets/Icons/Projects_section/taxi_management.svg', selected: false, featureName: 'has_taxi_management'  },
  { name: 'Valet Parking', type: ProjectActivityType.ValetParking, icon: 'assets/Icons/Projects_section/valet_parking.svg', selected: false, featureName: 'has_valet_parking'  },
  { name: 'Rental Car', type: ProjectActivityType.RentalCar, icon: 'assets/Icons/Projects_section/rental_car.svg', selected: false, featureName: 'has_rental_car'  },
];

export const ProjectSection = {
  insideProjectInfoTabIndex: 7
};