import { filter } from 'rxjs/operators';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CoreService } from '../../services/core.service';
import { CurrentUserService } from '../../services/current-user.service';
import { sidebarConfig } from './sidebar.config';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  sidebarStatus: string;
  sidebarConfig = sidebarConfig;
  environment = environment;

  private toggleSubscription: Subscription;
  private sidebarSubscription: Subscription;

  constructor(
    public authService: AuthService,
    private coreService: CoreService,
    private router: Router,
    private currentUserService: CurrentUserService
  ) {
    this.sidebarStatus = 'inactive';
  }

  ngOnInit() {
    this.toggleSubscription = this.coreService.toggleSidebar
      .subscribe(() => {
        this.sidebarStatus = this.sidebarStatus === 'active'
          ? 'inactive'
          : 'active';
      });
    this.sidebarSubscription = this.coreService.updateSidebarMenu
      .subscribe(() => {
        this.updateMenuStatus();
      });
    if (this.authService.authStatusSub.getValue()) {
      this.updateMenuStatus();
    }

    this.hoverSidebar();
  }

  hoverSidebar() {
    if ( this.router.url.indexOf('update-details') > 0 ) {
      console.log($('.collapse#adminMenu').length);
    }
  }

  ngOnDestroy(): void {
    this.toggleSubscription.unsubscribe();
    this.sidebarSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        let url = event.url;
        if (/client\/client\/*/.test(url)) url = '/client/client';
        if (/client\/vehicle\/*/.test(url)) url = '/client/vehicle';
        if (/client\/membership\/*/.test(url)) url = '/client/membership';
        if (/assets\/tvm\/*/.test(url)) url = '/assets/tvm';
        if (/assets\/barrier\/*/.test(url)) url = '/assets/barrier';
        if (/assets\/fixed-anpr\/*/.test(url)) url = '/assets/fixed-anpr';
        if (/assets\/p-and-d\/*/.test(url)) url = '/assets/p-and-d';
        if (/assets\/rfid-antenna\/*/.test(url)) url = '/assets/rfid-antenna';
        if (/assets\/ticket-dispenser\/*/.test(url))
          url = '/assets/ticket-dispenser';
        if (/assets\/ticket-verifier\/*/.test(url))
          url = '/assets/ticket-verifier';
        if (/assets\/tow-vehicle\/*/.test(url)) url = '/assets/tow-vehicle';

        // HR
        if (/employees\/*/.test(url)) url = '/employees';
        if (/workplans\/*/.test(url)) url = '/workplans';
        if (/assignments\/*/.test(url)) url = '/assignments';

        // Admin
        if (/admin\/*/.test(url)) url = '/admin';
        // Tariff
        if (/tariff\/*/.test(url)) url = '/tariff';
        if (/enforcement\/*/.test(url)) url = '/enforcement';

        // Setting
        if (/default-values\/*/.test(url)) url = '/default-values';
        // Operations

        switch (url) {
          case '/crm/job':
          case '/crm/contravention':
            $('.collapse:not(#crmMenu)').collapse('hide');
            $('.collapse#crmMenu').collapse('show');
            break;
          case '/project/list':
          case '/project/new':
            $('.collapse:not(#projectsMenu)').collapse('hide');
            $('.collapse#projectsMenu').collapse('show');
            break;
          case '/employees':
            $('.collapse:not(#humanResourcesMenu)').collapse('hide');
            $('.collapse#humanResourcesMenu').collapse('show');
            break;
          case '/workplans':
            $('.collapse:not(#humanResourcesMenu)').collapse('hide');
            $('.collapse#humanResourcesMenu').collapse('show');
            break;
          case '/default-values':
            $('.collapse:not(#settingMenu)').collapse('hide');
            $('.collapse#settingMenu').collapse('show');
            break;
          case '/assignments':
            $('.collapse:not(#humanResourcesMenu)').collapse('hide');
            $('.collapse#humanResourcesMenu').collapse('show');
            break;

          case '/client/membership':
          case '/client/vehicle':
          case '/client/client':
            $('.collapse:not(#clientMenu)').collapse('hide');
            $('.collapse#clientMenu').collapse('show');
            break;
          case '/assets/tvm':
          case '/assets/barrier':
          case '/assets/fixed-anpr':
          case '/assets/p-and-d':
          case '/assets/rfid-antenna':
          case '/assets/ticket-dispenser':
          case '/assets/ticket-verifier':
          case '/assets/tow-vehicle':
            $('.collapse:not(#assetsMenu)').collaenforcementpse('hide');
            $('.collapse#assetsMenu').collapse('show');
            break;
          case '/admin':
            $('.collapse:not(#adminMenu)').collapse('hide');
            $('.collapse#adminMenu').collapse('show');
            break;
          case '/enforcement':
          case '/tariff':
            $('.collapse:not(#tariffMenu)').collapse('hide');
            $('.collapse#tariffMenu').collapse('show');
            break;
          case '/operation/cn-review':
            $('.collapse:not(#operationMenu)').collapse('hide');
            $('.collapse#operationMenu').collapse('show');
            break;
          case '/operation/cn-challenge':
            $('.collapse:not(#operationMenu)').collapse('hide');
            $('.collapse#operationMenu').collapse('show');
            break;
          default:
            $('.collapse').collapse('hide');
            break;
        }
      });
  }

  async updateMenuStatus() {
    const currentUser = await this.currentUserService.get();
    Object.keys(this.sidebarConfig).forEach(menuItem => {
        this.sidebarConfig[menuItem].enabled = CurrentUserService.canView(
            currentUser,
            this.sidebarConfig[menuItem].features
        );
    });
  }
}
