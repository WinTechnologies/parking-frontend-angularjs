export class PgActEnforcementIncentiveBand {
  band_id?: number;
  calculate_type: string;
  rank: number;
  value_per_unity?: number;
  value_on_currency?: number;
  forecast_per_unity?: number;
  forecast_on_currency?: number;
  incentive_id?: string;
  unity: string;

  constructor(band_id?: number, calculate_type?: string, rank?: number, value_per_unity?: number,
              value_on_currency?: number, forecast_per_unity?: number, forecast_on_currency?: number,
              incentive_id?: string, unity?: string)
  {
    this.band_id = band_id;
    this.calculate_type = calculate_type;
    this.rank = rank;
    this.value_per_unity = value_per_unity;
    this.value_on_currency = value_on_currency;
    this.forecast_per_unity = forecast_per_unity;
    this.forecast_on_currency = forecast_on_currency;
    this.incentive_id = incentive_id;
    this.unity = unity;
  }
}