class CNChart {
  deployed: number;
  numberOfCreatedCNs: number;
  predicted: number;
}

class JobChart {
  deployed: number;
  numberOfJobs: number;
  predicted: number;
}

export class EnforcementWidget {
  atvChart: string;
  clampVanChart: string;
  currency: string;
  eoChart: string;
  eoGapChart: number;
  towTruckChart: string;
  towTruckGapChart: number;
  issuanceCN: CNChart;
  clampedChart: JobChart;
  towedChart: JobChart;
}

export class OnStreetWidget {
  alsChart: string;
  atvChart: string;
  currency: string;
  paidOccupancyChart: number;
  parkingMeterChart: any;
  paymentChart: any;
  revenueChart: any;
  revenuePerSpaceChart: any;
  spacesChart: any;
  violationsChart: any;
}