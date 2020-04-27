export enum ViewMode {
  MapView,
  ListView,
}

export enum FormMode {
  SELECTING,
  UPDATING,
  JUST_UPDATED,
  CREATING,
  JUST_CREATED,
  JUST_DELETED,
}

export enum CarparkItemType {
  Zone = 'Zone',
  Terminal = 'Terminal',
  Parking = 'Carpark',
  Level = 'Level',
  ParkZone = 'Carpark Zone',
  Gate = 'Gate',
  Lane = 'Lane',
  ParkSpace = 'Park Space',
  Asset = 'Asset',
}

export enum CarparkItemLevel {
  Zone = 0,
  Terminal = 1,
  Parking = 2,
  Level = 3,
  ParkZone = 4,
  Gate = 5,
  Lane = 6,
  ParkSpace = 5,
  Asset = 5,
  MAX = 100,
}

export class CarparkItem {
  type: CarparkItemType;
  name: string;
  level: number;
  activeIcon: string;
  inactiveIcon: string;
  selectedIcon: string;
}

export const CarparkItems: CarparkItem[] = [
  {
    type: CarparkItemType.Zone,
    name: 'Zone',
    level: CarparkItemLevel.Zone,
    activeIcon: 'assets/project-setup/Zone_active.svg',
    inactiveIcon: 'assets/project-setup/Zone_inactive.svg',
    selectedIcon: 'assets/project-setup/Zone_selected.svg',
  },
  {
    type: CarparkItemType.Terminal,
    name: 'Terminal',
    level: CarparkItemLevel.Terminal,
    activeIcon: 'assets/project-setup/Terminal_active.svg',
    inactiveIcon: 'assets/project-setup/Terminal_inactive.svg',
    selectedIcon: 'assets/project-setup/Terminal_selected.svg',
  },
  {
    type: CarparkItemType.Parking,
    level: CarparkItemLevel.Parking,
    name: 'Parking',
    activeIcon: 'assets/project-setup/Parking_active.svg',
    inactiveIcon: 'assets/project-setup/Parking_inactive.svg',
    selectedIcon: 'assets/project-setup/Parking_selected.svg',
  },
  {
    type: CarparkItemType.Level,
    name: 'Level',
    level: CarparkItemLevel.Level,
    activeIcon: 'assets/project-setup/Level_active.svg',
    inactiveIcon: 'assets/project-setup/Level_inactive.svg',
    selectedIcon: 'assets/project-setup/Level_selected.svg',
  },
  {
    type: CarparkItemType.ParkZone,
    level: CarparkItemLevel.ParkZone,
    name: 'Park Zone',
    activeIcon: 'assets/project-setup/Park_zone_active.svg',
    inactiveIcon: 'assets/project-setup/Park_zone_inactive.svg',
    selectedIcon: 'assets/project-setup/Park_zone_selected.svg',
  },
  {
    type: CarparkItemType.Gate,
    level: CarparkItemLevel.Gate,
    name: 'Gate',
    activeIcon: 'assets/project-setup/Gate_active.svg',
    inactiveIcon: 'assets/project-setup/Gate_inactive.svg',
    selectedIcon: 'assets/project-setup/Gate_selected.svg',
  },
  {
    type: CarparkItemType.Lane,
    name: 'Lane',
    level: CarparkItemLevel.Lane,
    activeIcon: 'assets/project-setup/Lane_active.svg',
    inactiveIcon: 'assets/project-setup/Lane_inactive.svg',
    selectedIcon: 'assets/project-setup/Lane_selected.svg',
  },
  {
    type: CarparkItemType.ParkSpace,
    level: CarparkItemLevel.ParkSpace,
    name: 'Park Space',
    activeIcon: 'assets/project-setup/Gate_active.svg',
    inactiveIcon: 'assets/project-setup/Gate_inactive.svg',
    selectedIcon: 'assets/project-setup/Gate_selected.svg',
  },
  {
    // Material
    type: CarparkItemType.Asset,
    name: 'Asset',
    level: CarparkItemLevel.Asset,
    activeIcon: 'assets/project-setup/Asset_active.svg',
    inactiveIcon: 'assets/project-setup/Asset_inactive.svg',
    selectedIcon: 'assets/project-setup/Asset_selected.svg',
  },
];

export class CarparkAsset {
  code: string;
  name: string;
  activeIcon: string;
  inactiveIcon: string;
  selectedIcon: string;
}
// export enum CarparkAssetType {
//   Camera,
//   TVM,
//   Barrier,
//   TDispenser,
//   TVerifier,
//   APM,
//   APM70,
//   APNR,
//   RFID,
//   IOCard,
//   LEDScreen,
//   Handheld,
//   SensorBeams,
// }
export const CarparkAssets: CarparkAsset[] = [
  {
    code: 'Camera',
    name: 'Camera',
    activeIcon: 'assets/project-setup/Camera_active.svg',
    inactiveIcon: 'assets/project-setup/Camera_inactive.svg',
    selectedIcon: 'assets/project-setup/Camera_selected.svg',
  },
  {
    code: 'TVM',
    name: 'TVM',
    activeIcon: 'assets/project-setup/TVM_active.svg',
    inactiveIcon: 'assets/project-setup/TVM_inactive.svg',
    selectedIcon: 'assets/project-setup/TVM_selected.svg',
  },
  {
    code: 'Barrier',
    name: 'Barrier',
    activeIcon: 'assets/project-setup/Barrier_active.svg',
    inactiveIcon: 'assets/project-setup/Barrier_inactive.svg',
    selectedIcon: 'assets/project-setup/Barrier_selected.svg',
  },
  {
    code: 'TDispenser',
    name: 'Ticket Dispenser 32-bit/64-bit',
    activeIcon: 'assets/assets-section/ticket_dispenser.svg',
    inactiveIcon: 'assets/assets-section/ticket_dispenser.svg',
    selectedIcon: 'assets/assets-section/ticket_dispenser_selected.svg',
  },
  {
    code: 'TVerifier',
    name: 'Ticket Verifier 32-bit/64-bit',
    activeIcon: 'assets/assets-section/ticket_verifier.svg',
    inactiveIcon: 'assets/assets-section/ticket_verifier.svg',
    selectedIcon: 'assets/assets-section/ticket_verifier_selected.svg',
  },
  {
    code: 'APM',
    name: 'APM ETS-100',
    activeIcon: 'assets/assets-section/apm.svg',
    inactiveIcon: 'assets/assets-section/apm.svg',
    selectedIcon: 'assets/assets-section/apm_selected.svg',
  },
  {
    code: 'APM70',
    name: 'APM ETS-70',
    activeIcon: 'assets/assets-section/apm.svg',
    inactiveIcon: 'assets/assets-section/apm.svg',
    selectedIcon: 'assets/assets-section/apm_selected.svg',
  },
  {
    code: 'APNR',
    name: 'APNR',
    activeIcon: 'assets/assets-section/apnr.svg',
    inactiveIcon: 'assets/assets-section/apnr.svg',
    selectedIcon: 'assets/assets-section/apnr_selected.svg',
  },
  {
    code: 'RFID',
    name: 'RFID',
    activeIcon: 'assets/assets-section/rfid.svg',
    inactiveIcon: 'assets/assets-section/rfid.svg',
    selectedIcon: 'assets/assets-section/rfid_selected.svg',
  },
  {
    code: 'IOCard',
    name: 'I/O Card',
    activeIcon: 'assets/assets-section/rfid.svg',
    inactiveIcon: 'assets/assets-section/rfid.svg',
    selectedIcon: 'assets/assets-section/rfid_selected.svg',
  },
  {
    code: 'LEDScreen',
    name: 'LED Screen',
    activeIcon: 'assets/assets-section/tablet.svg',
    inactiveIcon: 'assets/assets-section/tablet.svg',
    selectedIcon: 'assets/assets-section/tablet_selected.svg',
  },
  {
    code: 'Handheld',
    name: 'Handheld devices',
    activeIcon: 'assets/assets-section/device.svg',
    inactiveIcon: 'assets/assets-section/device.svg',
    selectedIcon: 'assets/assets-section/device_selected.svg',
  },
  {
    code: 'SensorBeams',
    name: 'Sensor Beams',
    activeIcon: 'assets/assets-section/sensors.svg',
    inactiveIcon: 'assets/assets-section/sensors.svg',
    selectedIcon: 'assets/assets-section/sensors_selected.svg',
  },
];
