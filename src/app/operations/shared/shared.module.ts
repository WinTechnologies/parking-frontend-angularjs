import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ToastrModule } from 'ngx-toastr';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

// ONLY FOR DEMO (Removable without changing any layout configuration)
import { CustomizerComponent } from '../shared/components/customizer/customizer.component';

// ALL TIME REQUIRED
import { OperationLayoutComponent } from '../shared/components/operation-layout/operation-layout.component'
import { NotificationsComponent } from '../shared/components/notifications/notifications.component';
import { BreadcrumbComponent } from '../shared/components/breadcrumb/breadcrumb.component';
import { AppConfirmComponent } from '../shared/services/app-confirm/app-confirm.component';
import { AppMessageComponent } from '../shared/services/app-confirm/app-message.component';
import { AppLoaderComponent } from '../shared/services/app-loader/app-loader.component';

// DIRECTIVES
import { FontSizeDirective } from './directives/font-size.directive';
import { ScrollToDirective } from './directives/scroll-to.directive';
import { AppDropdownDirective } from './directives/dropdown.directive';
import { DropdownAnchorDirective } from './directives/dropdown-anchor.directive';
import { DropdownLinkDirective } from './directives/dropdown-link.directive';
import { EgretSideNavToggleDirective } from './directives/egret-side-nav-toggle.directive';

// PIPES
import { RelativeTimePipe } from './pipes/relative-time.pipe';
import { ExcerptPipe } from './pipes/excerpt.pipe';
import { GetValueByKeyPipe } from './pipes/get-value-by-key.pipe';
import { TranstalePhrasePipe } from './pipes/transtale-phrase.pipe';

// SERVICES
import { ThemeService } from './services/theme.service';
import { NavigationService } from './services/navigation.service';
import { RoutePartsService } from './services/route-parts.service';
import { AppConfirmService } from './services/app-confirm/app-confirm.service';
import { AppLoaderService } from './services/app-loader/app-loader.service';
import { NotificationService } from './services/notification.service';
import { CentralDataService } from './services/central-data.service';
import { ButtonLoadingComponent } from './components/button-loading/button-loading.component';

// submodules
import { SearchModule } from './search/search.module';
/*
  Only Required if you want to use Angular Landing
  (https://themeforest.net/item/angular-landing-material-design-angular-app-landing-page/21198258)
*/
// import { LandingPageService } from '../shared/services/landing-page.service';

const classesToInclude = [
  NotificationsComponent,
  OperationLayoutComponent,
  BreadcrumbComponent,
  AppConfirmComponent,
  AppLoaderComponent,
  AppMessageComponent,
  CustomizerComponent,
  ButtonLoadingComponent,
  FontSizeDirective,
  ScrollToDirective,
  AppDropdownDirective,
  DropdownAnchorDirective,
  DropdownLinkDirective,
  EgretSideNavToggleDirective,
  RelativeTimePipe,
  ExcerptPipe,
  GetValueByKeyPipe,
  TranstalePhrasePipe,
];

const modulesToInclude = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatOptionModule,
    MatSelectModule,
    MatMenuModule,
    MatTabsModule,
    MatSnackBarModule,
    MatGridListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatDialogModule,
    SearchModule,
    PerfectScrollbarModule,
];

@NgModule({
  imports: [
    ...modulesToInclude,

    ToastrModule.forRoot({
      preventDuplicates: true,
      countDuplicates: true,
    }),
  ],
  entryComponents: [AppConfirmComponent, AppMessageComponent, AppLoaderComponent],
  providers: [
    ThemeService,
    NavigationService,
    RoutePartsService,
    AppConfirmService,
    AppLoaderService,
    NotificationService,
    CentralDataService,
    // LandingPageService
  ],
  declarations: classesToInclude,
  exports: [
    ...classesToInclude,
    ...modulesToInclude,
  ]
})
export class SharedModule { }
