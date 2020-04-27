export enum ParkingClientType {
  VISITOR = 'VISITOR',
  MEMBER = 'MEMBER',
  RESIDENT = 'RESIDENT'
}

export enum ParkingPriceTypes {
  Absolute = 'Absolute',
  FixedRate = 'Fixed Rate',
  Ladder = 'Ladder',
  Custom = 'Custom',
  Standard = 'Standard'
}

export enum ParkingStreetType {
  OnStreet = 'onstreet',
  Carpark = 'carpark'
}

export enum ParkingTimeType {
  TOD = 'TOD', // Time of the Day
  GTS = 'GTS' // Global Time Spent
}

export const tariffParkingConfig = {
  clientTypes: [ParkingClientType.VISITOR, ParkingClientType.MEMBER, ParkingClientType.RESIDENT],
  priceTypes: [ParkingPriceTypes.Absolute, ParkingPriceTypes.FixedRate, ParkingPriceTypes.Ladder, ParkingPriceTypes.Custom],
  timeTypes: [ParkingTimeType.TOD, ParkingTimeType.GTS]
};
