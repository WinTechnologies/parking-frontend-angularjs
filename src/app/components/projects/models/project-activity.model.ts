export class ProjectActivity {
  id: string;
  has_on_street: boolean;
  has_car_park: boolean;
  has_enforcement: boolean;
  has_taxi_management: boolean;
  has_valet_parking: boolean;
  has_rental_car: boolean;
  project_id: number;
  created_at: any;

  constructor () {
    this.has_on_street = false;
    this.has_car_park = false;
    this.has_enforcement = false;
    this.has_taxi_management = false;
    this.has_valet_parking = false;
    this.has_rental_car = false;
    this.created_at = new Date();
  }

  public isNotEqual(other: ProjectActivity) : boolean {
    const findItem = Object.keys(this).find(field => {
      return this[field] !== other[field] && field !== 'created_at';
    });
    return !!findItem;
  }
}