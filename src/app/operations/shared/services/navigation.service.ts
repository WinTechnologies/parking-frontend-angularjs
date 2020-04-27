import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IMenuItem {
  type: string;       // Possible values: link/dropDown/icon/separator/extLink
  name?: string;      // Used as display text for item and title for separator type
  state?: string;     // Router state
  icon?: string;      // Material icon name
  tooltip?: string;   // Tooltip text
  disabled?: boolean; // If true, item will not be appeared in sidenav.
  sub?: IChildItem[]; // Dropdown items
  badges?: IBadge[];
  features: string | string[];
}
interface IChildItem {
  type?: string;
  name: string;       // Display text
  state?: string;     // Router state
  icon?: string;
  sub?: IChildItem[];
  features?: string | string[];
}

interface IBadge {
  color: string;      // primary/accent/warn/hex color codes(#fff000)
  value: string;      // Display text
}

@Injectable()
export class NavigationService {

  iconMenu: IMenuItem[] = [
    /*{
      name: 'common.finance',
      type: 'link',
      tooltip: 'Finance',
      icon: 'account_balance',
      state: 'finance'
    },*/
    {
      name: 'common.enforcement',
      type: 'dropDown',
      tooltip: 'Enforcement',
      icon: 'security',
      state: 'enforcement',
      features: ['enforcement_cashier', 'enforcement_cn_challenge', 'enforcement_cn_review'],
      sub: [
        { name: 'common.cashier', state: 'cashier', icon: './assets/images/cashiering.svg', features: 'enforcement_cashier' },
        { name: 'common.cn_challenge', state: 'challenge', icon: './assets/images/CN challenge.svg', features: 'enforcement_cn_challenge' },
        { name: 'common.cn_review', state: 'review', icon: './assets/images/CN review.svg', features: 'enforcement_cn_review' },
        { name: 'common.escape', state: 'escape', icon: './assets/images/CN review.svg', features: 'enforcement_escape' },
      ]
    },
    {
      name: 'common.car_parks',
      type: 'dropDown',
      tooltip: 'Car Parks',
      icon: 'directions_car',
      state: 'car-parks',
      features: ['carpark_cashier'],
      sub: [
        { name: 'common.cashier', type: 'link', state: '/cashier', icon: './assets/images/cashiering.svg', features: 'carpark_cashier' },
        { name: 'common.search_lost_ticket', type: 'link', state: '/search-lost', icon: './assets/images/cashiering.svg', features: 'carpark_search_lost_ticket' },
        { name: 'common.escape', state: 'escape', icon: './assets/images/CN review.svg', features: 'carpark_escape' },
      ]
    },
  ];
  // Icon menu TITLE at the very top of navigation.
  // This title will appear if any icon type item is present in menu.
  iconTypeMenuTitle = 'Frequently Accessed';
  // sets iconMenu as default;
  menuItems = new BehaviorSubject<IMenuItem[]>(this.iconMenu);
  // navigation component has subscribed to this Observable
  menuItems$ = this.menuItems.asObservable();

  constructor() { }

  // Customizer component uses this method to change menu.
  // You can remove this method and customizer component.
  // Or you can customize this method to supply different menu for
  // different user type.
  publishNavigationChange(menuType: string) {
    switch (menuType) {
      // case 'separator-menu':
      //   this.menuItems.next(this.separatorMenu);
      //   break;
      // case 'icon-menu':
      //   this.menuItems.next(this.iconMenu);
      //   break;
      default:
        this.menuItems.next(this.iconMenu);
    }
  }
}
