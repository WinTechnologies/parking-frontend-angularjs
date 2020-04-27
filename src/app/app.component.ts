import {Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CoreService } from './services/core.service';
import { AuthService } from './core/services/auth.service';
// import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Datategy';

  showSidebar$: Observable<boolean>;
  private defaultShowSidebar = true;

  showNavbar$: Observable<boolean>;
  private defaultShowNavbar = true;
  contentStatus = true;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public coreService: CoreService,
    private authService: AuthService,
    // private translate: TranslateService,
  ) {

      // // Set a default translation
      // translate.setDefaultLang('en');

    // Handle hiding sidebar for particular routes.
    this.showSidebar$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      mergeMap(route => route.data),
      map(data => data.hasOwnProperty('showSidebar') ? data.showSidebar : this.defaultShowSidebar),
    );

    // Handle hiding navbar for particular routes.
    this.showNavbar$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      mergeMap(route => route.data),
      map(data => data.hasOwnProperty('showNavbar') ? data.showNavbar : this.defaultShowNavbar),
    );

  }

  ngOnInit() {
    this.coreService.toggleSidebar.subscribe(() => {
        this.contentStatus = !this.contentStatus;
    });

    this.authService.autoLoadAuthData();
  }

}

