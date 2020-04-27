import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {CurrentUserService} from '../../../../services/current-user.service';
import {LoaderService} from '../../../../services/loader.service';
import {Promotion} from '../../models/promotion.model';
import {globalProjectActivities, ProjectActivityItem} from '../../../../components/projects/models/project.model';
import {PromotionService} from '../../services/promotion.service';
import {ToastrService} from 'ngx-toastr';
import {AlertdialogComponent} from '../../../../components/alertdialog/alertdialog.component';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss']
})
export class PromotionsComponent implements OnInit {

  today: any;

  // Permission Feature
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  arrangeFields = [
    {label: 'Name a-z', fieldName: 'promo_name_en'},
    {label: 'Valid date', fieldName: 'date_end'},
    {label: 'Date create', fieldName: 'date_created'}
  ];
  viewFilters = ['All', 'Expired', 'Available', 'Future'];
  activityFilters: ProjectActivityItem[] = globalProjectActivities.slice(0);

  selectedView: string;
  selectedActivity: string;

  originPromotions: Promotion[] = [];
  filteredPromotions: Promotion[] = [];

  constructor(
    private location: Location,
    private currentUserService: CurrentUserService,
    private loaderService: LoaderService,
    private promotionsService: PromotionService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  async ngOnInit() {

    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);

    try {
      this.loaderService.enable();
      const currentUser = await this.currentUserService.get();
      this.permission = CurrentUserService.canFeature(currentUser, 'tariff_promotion');
      await this.getPromotions();
    } finally {
      this.loaderService.disable();
    }
  }

  async getPromotions() {
    this.originPromotions = await this.promotionsService.getPromotions();
    this.filteredPromotions = [...this.originPromotions];
  }

  onViewDetail(promotion) {
    this.router.navigate(['id', promotion.id]);
  }

  async onRemovePromotion(event, promotion) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loaderService.enable();
        this.promotionsService.deletePromotion(promotion.id)
          .then(response => {
            this.toastrService.success('The promotion is deleted successfully!', 'Success!');
            this.getPromotions();
            this.loaderService.disable();
          })
        ;
      }
    });
  }

  onBack() {
    this.location.back();
  }

  applyFilterService(filter) {
    filter = filter.trim().toLowerCase();
    this.filteredPromotions = this.originPromotions.filter( promotion => promotion.promo_name_en.toLocaleLowerCase().includes(filter));
  }

  arrangeByField(fieldName) {
    this.filteredPromotions.sort((promotionA, promotionB) => {
      let compareA, compareB;
      if (fieldName === 'promo_name_en') {
        compareA = promotionA[fieldName].toLowerCase();
        compareB = promotionB[fieldName].toLowerCase();
      } else {
        compareA = new Date(promotionA[fieldName]);
        compareB = new Date(promotionB[fieldName]);
      }

      if (compareA < compareB) {
        return -1;
      }
      if (compareA > compareB) {
        return 1;
      }
      return 0;
    });

    this.filteredPromotions = this.filteredPromotions.slice(0);
  }

  filterByView(event) {
    switch (event.value) {
      case 'All':
        this.filteredPromotions = this.originPromotions.slice(0);
        return;
      case 'Available':
        this.filteredPromotions = this.originPromotions.filter(promotion => {
          if (new Date(promotion.date_start) <= this.today && (!promotion.date_end || new Date(promotion.date_end) >= this.today)) {
            return promotion;
          }
        });
        return;
      case 'Expired':
        this.filteredPromotions = this.originPromotions.filter(promotion => new Date(promotion.date_start) < this.today && promotion.activity);
        return;
      case 'Future':
        this.filteredPromotions = this.originPromotions.filter(promotion => new Date(promotion.date_start) > this.today && promotion.activity);
        return;
      default:
        break;
    }
  }

  public filterPromotions() {
    const view = !this.selectedView ? 'All' : this.selectedView;
    const activity = !this.selectedActivity ? 'all' : this.selectedActivity;

    switch (view) {
      case 'All':
          if ( activity === 'all' ) {
            this.filteredPromotions = this.originPromotions.slice(0);
          } else {
            this.filteredPromotions = this.originPromotions.filter(promotion => promotion.activity === activity );
          }
          return;
      case 'Available':
          if ( activity === 'all' ) {
            this.filteredPromotions = this.originPromotions.filter(promotion => {
              if ( ( new Date(promotion.date_start) <= this.today && (!promotion.date_end || new Date(promotion.date_end) >= this.today) ) ) {
                return promotion;
              }
            });
          } else {
            this.filteredPromotions = this.originPromotions.filter(promotion => {
              if ( ( new Date(promotion.date_start) <= this.today && (!promotion.date_end || new Date(promotion.date_end) >= this.today) )  && promotion.activity === activity) {
                return promotion;
              }
            });
          }
          return;
      case 'Expired':
          if ( activity === 'all' ) {
            this.filteredPromotions = this.originPromotions.filter(promotion => new Date(promotion.date_end) < this.today);
          } else {
            this.filteredPromotions = this.originPromotions.filter(promotion => new Date(promotion.date_end) < this.today && promotion.activity === activity);
          }
          return;
      case 'Future':
          if ( activity === 'all' ) {
            this.filteredPromotions = this.originPromotions.filter(promotion => new Date(promotion.date_start) > this.today);
          } else {
            this.filteredPromotions = this.originPromotions.filter(promotion => new Date(promotion.date_start) > this.today && promotion.activity === activity);
          }
          return;
      default:
          this.filteredPromotions = this.originPromotions.filter(promotion => promotion.activity === activity);
          return;
    }

  }

  getActivityName(featureName) {
    const selectedActivity = this.activityFilters.find(activity => activity.featureName === featureName);
    return selectedActivity.name;
  }

  checkExpired(promotion) {
    return !!promotion.date_end && new Date(promotion.date_end) < this.today;
  }

}
