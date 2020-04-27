import { Component, Inject, OnInit } from '@angular/core';
import { TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import { IncentiveDialogComponent } from '../../projects/project-list/productivity/incentive/incentive-dialog/incentive-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-filterdialog',
  templateUrl: './filterdialog.component.html',
  styleUrls: ['./filterdialog.component.css']
})

export class FilterdialogComponent implements OnInit {
  // each object correspond to one column
  itemsOnStreets: TreeviewItem[];
  itemsCarParks: TreeviewItem[];
  itemsEnforcement: TreeviewItem[];
  itemsEnforcementCRM: TreeviewItem[];

  // The arrays with the selected value
  selectedOnStreets: string[];
  selectedCarParks: string[];
  selectedEnforcement: string[];
  selectedEnforcementCRM: string[];

  config = TreeviewConfig.create({
    hasAllCheckBox: true,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 400
  });

  // Objects to make the correspondance between the ids of the fields defined on the tree and the label of the field
  indexOnStreets = {
    11: 'Parking_Meters', 12: 'Signages', 13: 'Sensors', 14: 'Parking', 141: 'Parking_Commercial', 142: 'Parking_Mixed',
    143: 'Parking_Residential', 144: 'Parking_Unmanaged', 15: 'Open_Land', 16: 'Zones'
  };
  indexCarParks = {
    21: 'Managed', 211: 'Managed_MSCP', 212: 'Managed_Surface', 213: 'Managed_Basement', 214: 'Managed_Automated',
    22: 'Unmanaged', 221: 'Unmanaged_MSCP', 222: 'Unmanaged_Surface', 223: 'Unmanaged_Basement', 224: 'Unmanaged_Automated'
  };
  indexEnforcement = {
    31: 'Tow_Trucks', 32: 'Clamp_Vans', 33: 'Enforcers', 34: 'Escalations', 341: 'Escalations_Captured',
    342: 'Escalations_Canceled', 35: 'Pounds', 36: 'Routes', 37: 'EOD', 38: 'Driver', 39: 'Clamper'
  };

  indexEnforcementCRM = {
    411: 'Observation', 412: 'Contravention', 413: 'Canceled Observation',

    421: 'TOW REQUESTED TOW JOB', 422: 'TOWED TOW JOB', 423: 'TOW IN ROUTE TOW JOB', 424: 'PAID TOW JOB',
    425: 'RELEASED TOW JOB', 426: 'CLOSED TOW JOB', 427: 'CANCELED TOW JOB', 428: 'MISSED TOW JOB',

    431: 'CLAMP REQUESTED CLAMP JOB', 432: 'CLAMPED CLAMP JOB', 433: 'CLAMP IN ROUTE CLAMP JOB', 434: 'PAID CLAMP JOB',
    435: 'RELEASED CLAMP JOB', 436: 'CLOSED CLAMP JOB', 437: 'CANCELED CLAMP JOB', 438: 'MISSED CLAMP JOB',

    441: 'DECLAMP REQUESTED DECLAMP JOB', 442: 'DECLAMP IN ROUTE DECLAMP JOB', 443: 'PAID DECLAMP JOB',
    444: 'RELEASED DECLAMP JOB', 445: 'CLOSED DECLAMP JOB', 446: 'CANCELED DECLAMP JOB', 447: 'MISSED DECLAMP JOB'
  };

  constructor(
    public dialogRef: MatDialogRef<IncentiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  /**
   * To initialize the trees
   */
  ngOnInit() {
    this.itemsOnStreets = this.getOnStreets();
    this.itemsCarParks = this.getCarParks();
    this.itemsEnforcement = this.getEnforcement();
    this.itemsEnforcementCRM = this.getEnforcementCRM();
  }

  onFilterChange(value: string) {
  }

  /**
   * to retrieve an array of TreeviewItem for the column onStreet
   */
  getOnStreets(): TreeviewItem[] {
    const parkingMeters = new TreeviewItem({text: 'Parking Meters', value: 11, checked: this.checkLabel('Parking_Meters', this.data.onStreets)}
    );
    const signages = new TreeviewItem({text: 'Signages', value: 12 , checked: this.checkLabel('Signages', this.data.onStreets)}
    );
    const sensors = new TreeviewItem({text: 'Parking Sensors', value: 13, checked: this.checkLabel('Sensors', this.data.onStreets)}
    );
    const parking = new TreeviewItem({
        text: 'Parking Type', value: 14, checked: false , children: [
          {text: 'Commercial', value: 141, checked: this.checkLabel('Parking_Commercial', this.data.onStreets)},
          {text: 'Mixed', value: 142, checked: this.checkLabel('Parking_Mixed', this.data.onStreets)},
          {text: 'Residential', value: 143, checked: this.checkLabel('Parking_Residential', this.data.onStreets)},
          {text: 'Unmanaged', value: 144, checked: this.checkLabel('Parking_Unmanaged', this.data.onStreets)}
        ]
      }
    );
    const vacantLand = new TreeviewItem({text: 'Open Land', value: 15, checked: this.checkLabel('Open_Land', this.data.onStreets)}
    );
    const zones = new TreeviewItem({text: 'Zones', value: 16, checked: this.checkLabel('Zones', this.data.onStreets)}
    );
    return [parkingMeters, signages, sensors, parking, vacantLand, zones];
  }

  /**
   * to retrieve an array of TreeviewItem for the column carParks
   */
  getCarParks(): TreeviewItem[] {
    const managed = new TreeviewItem({
      text: 'Managed', value: 21, checked: false, children: [
        {text: 'MSCP', value: 211, checked: this.checkLabel('Managed_MSCP', this.data.carParks)},
        {text: 'Surface', value: 212, checked: this.checkLabel('Managed_Surface', this.data.carParks)},
        {text: 'Basement', value: 213, checked: this.checkLabel('Managed_Basement', this.data.carParks)},
        {text: 'Automated', value: 214, checked: this.checkLabel('Managed_Automated', this.data.carParks)}
      ]
    });
    const unManaged = new TreeviewItem({
      text: 'Unmanaged', value: 22, checked: false, children: [
        {text: 'MSCP', value: 221, checked: this.checkLabel('Unmanaged_MSCP', this.data.carParks)},
        {text: 'Surface', value: 222, checked: this.checkLabel('Unmanaged_Surface', this.data.carParks)},
        {text: 'Basement', value: 223, checked: this.checkLabel('Unmanaged_Basement', this.data.carParks)},
        {text: 'Automated', value: 224, checked: this.checkLabel('Unmanaged_Automated', this.data.carParks)}
      ]
    });
    return [managed, unManaged];

  }

  /**
   * to retrieve an array of TreeviewItem for the column enforcement
   */
  getEnforcement(): TreeviewItem [] {
    const towTrucks = new TreeviewItem({text: 'Tow Trucks', value: 31, checked: this.checkLabel('Tow_Trucks', this.data.enforcement)});
    const clampVan = new TreeviewItem({text: 'Clamp Vans', value: 32, checked: this.checkLabel('Clamp_Vans', this.data.enforcement)});
    const enforcers = new TreeviewItem({text: 'Enforcers', value: 33, checked: this.checkLabel('Enforcers', this.data.enforcement)});
    const eods = new TreeviewItem({text: 'EODs', value: 37, checked: this.checkLabel('EOD', this.data.enforcement)});
    const drivers = new TreeviewItem({text: 'Drivers', value: 38, checked: this.checkLabel('Driver', this.data.enforcement)});
    const clampers = new TreeviewItem({text: 'Clampers', value: 39, checked: this.checkLabel('Clamper', this.data.enforcement)});
    const escalations = new TreeviewItem({
      text: 'Escalations', value: 34, checked: false, children: [
        {text: 'Captured', value: 341, checked: this.checkLabel('Escalations_Captured', this.data.enforcement)},
        {text: 'Canceled', value: 342, checked: this.checkLabel('Escalations_Canceled', this.data.enforcement)}
      ]
    });
    const pounds = new TreeviewItem({text: 'Pounds', value: 35, checked: this.checkLabel('Pounds', this.data.enforcement)});
    const routes = new TreeviewItem({text: 'Routes', value: 36, checked: this.checkLabel('Routes', this.data.enforcement)});
    return [towTrucks, clampVan, enforcers, // eods,
      drivers, clampers, escalations, pounds, routes];
  }

  /**
   * to retrieve an array of TreeviewItem for the column 2nd enforcement (jobs and contraventions)
   */
  getEnforcementCRM(): TreeviewItem [] {
    const contraventions = new TreeviewItem({
      text: 'Contraventions', value: 41, checked: false, children: [
        {text: 'Observation' , value: 411, checked: this.checkLabel('Observation', this.data.enforcementCRM)},
        {text: 'Contravention' , value: 412, checked: this.checkLabel('Contravention', this.data.enforcementCRM)},
        {text: 'Canceled Observation' , value: 413, checked: this.checkLabel('Canceled Observation', this.data.enforcementCRM)}
      ]
    });
    const tow = new TreeviewItem({
      text: 'Tow job', value: 42, checked: false, children: [
        {text: 'TOW REQUESTED' , value: 421, checked: this.checkLabel('TOW REQUESTED TOW JOB', this.data.enforcementCRM)},
        {text: 'TOWED' , value: 422, checked: this.checkLabel('TOWED TOW JOB', this.data.enforcementCRM)},
        {text: 'TOW IN ROUTE' , value: 423, checked: this.checkLabel('TOW IN ROUTE TOW JOB', this.data.enforcementCRM)},
        {text: 'PAID' , value: 424, checked: this.checkLabel('PAID TOW JOB', this.data.enforcementCRM)},
        {text: 'RELEASED' , value: 425, checked: this.checkLabel('RELEASED TOW JOB', this.data.enforcementCRM)},
        {text: 'CLOSED' , value: 426, checked: this.checkLabel('CLOSED TOW JOB', this.data.enforcementCRM)},
        {text: 'CANCELED' , value: 427, checked: this.checkLabel('CANCELED TOW JOB', this.data.enforcementCRM)},
        {text: 'MISSED' , value: 428, checked: this.checkLabel('MISSED TOW JOB', this.data.enforcementCRM)},
      ]
    });

    const clamp = new TreeviewItem({
      text: 'Clamp job', value: 43, checked: false, children: [
        {text: 'CLAMP REQUESTED' , value: 431, checked: this.checkLabel('CLAMP REQUESTED CLAMP JOB', this.data.enforcementCRM)},
        {text: 'CLAMPED' , value: 432, checked: this.checkLabel('CLAMPED CLAMP JOB', this.data.enforcementCRM)},
        {text: 'CLAMP IN ROUTE' , value: 433, checked: this.checkLabel('CLAMP IN ROUTE CLAMP JOB', this.data.enforcementCRM)},
        {text: 'PAID' , value: 434, checked: this.checkLabel('PAID CLAMP JOB', this.data.enforcementCRM)},
        {text: 'RELEASED' , value: 435, checked: this.checkLabel('RELEASED CLAMP JOB', this.data.enforcementCRM)},
        {text: 'CLOSED' , value: 436, checked: this.checkLabel('CLOSED CLAMP JOB', this.data.enforcementCRM)},
        {text: 'CANCELED' , value: 437, checked: this.checkLabel('CANCELED CLAMP JOB', this.data.enforcementCRM)},
        {text: 'MISSED' , value: 438, checked: this.checkLabel('MISSED CLAMP JOB', this.data.enforcementCRM)},
      ]
    });
    const declamp = new TreeviewItem({
      text: 'Declamp job', value: 44, checked: false, children: [
        {text: 'DECLAMP REQUESTED' , value: 441, checked: this.checkLabel('DECLAMP REQUESTED DECLAMP JOB', this.data.enforcementCRM)},
        {text: 'DECLAMP IN ROUTE' , value: 442, checked: this.checkLabel('DECLAMP IN ROUTE DECLAMP JOB', this.data.enforcementCRM)},
        {text: 'PAID' , value: 443, checked: this.checkLabel('PAID DECLAMP JOB', this.data.enforcementCRM)},
        {text: 'RELEASED' , value: 444, checked: this.checkLabel('RELEASED DECLAMP JOB', this.data.enforcementCRM)},
        {text: 'CLOSED' , value: 445, checked: this.checkLabel('CLOSED DECLAMP JOB', this.data.enforcementCRM)},
        {text: 'CANCELED' , value: 446, checked: this.checkLabel('CANCELED DECLAMP JOB', this.data.enforcementCRM)},
        {text: 'MISSED' , value: 447, checked: this.checkLabel('MISSED DECLAMP JOB', this.data.enforcementCRM)},
      ]
    });
    return [contraventions, tow, clamp, declamp];
  }

  /**
   * To check if the box was already checked
   * @param label
   * @param items
   */
  checkLabel(label: string, items: string[]): boolean {
    return items.includes(label);
  }

  /**
   * To retrieve the ids of the checked box
   * @param items
   * @param column name of the box
   */
  onSelectedChange(items: number[], column: string) {
    if (column === 'onStreets') {
      this.selectedOnStreets = [];
      items.forEach(item => {
        this.selectedOnStreets.push(this.indexOnStreets[item]);
      });
    } else if (column === 'carParks') {
      this.selectedCarParks = [];
      items.forEach(item => {
        this.selectedCarParks.push(this.indexCarParks[item]);
      });
    } else if (column === 'enforcement') {
      this.selectedEnforcement = [];
      items.forEach(item => {
        this.selectedEnforcement.push(this.indexEnforcement[item]);
      });
    } else if (column === 'enforcementCRM') {
      this.selectedEnforcementCRM = [];
      items.forEach(item => {
        this.selectedEnforcementCRM.push(this.indexEnforcementCRM[item]);
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * To send the arrays withe the value of the checked box
   */
  onSave(): void {
    this.dialogRef.close({
      selectedOnStreets: this.selectedOnStreets || [],
      selectedCarParks: this.selectedCarParks || [],
      selectedEnforcement: this.selectedEnforcement || [],
      selectedEnforcementCRM: this.selectedEnforcementCRM || []
    });
  }
}