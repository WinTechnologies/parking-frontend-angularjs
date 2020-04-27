import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CnReviewRouting } from './cn-review.routing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NguCarouselModule } from '@ngu/carousel';
import { SignaturePadModule } from 'angular2-signaturepad';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CnReviewComponent } from './cn-review.component';
import { CnReviewDetailsComponent } from './cn-review-details/cn-review-details.component';
import { ContraventionService } from '../../../services/contravention.service';
import { ChallengeService } from '../../services/challenge.service';
import { ReviewService } from '../../services/review.service';
import { RaiseChallengeComponent } from './raise-challenge/raise-challenge.component';
@NgModule({
  declarations: [
    CnReviewComponent,
    CnReviewDetailsComponent,
    RaiseChallengeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatTooltipModule,
    AmazingTimePickerModule,
    NgxDatatableModule,
    NguCarouselModule,
    SignaturePadModule,
    NgxBarcodeModule,
    RouterModule.forChild(CnReviewRouting),
  ],
  providers: [
    ContraventionService,
    ChallengeService,
    ReviewService,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  entryComponents: [

  ]
})
export class CnReviewModule { }
