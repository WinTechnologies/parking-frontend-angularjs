import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ValueAdded } from '../models/value-added.model';
import { PgValueAddedService } from '../services/value-added.service';
import { MatDialog } from '@angular/material';
import { AlertdialogComponent } from '../../alertdialog/alertdialog.component';
import { ToastrService } from 'ngx-toastr';
import { PgBundleService } from '../services/bundle.service';
import { forkJoin } from 'rxjs';
import { Bundle } from '../models/bundle.model';
import { CurrentUserService } from '../../../services/current-user.service';
import { PgBundleValueAddedService } from '../services/bundle-value-add.service';

@Component({
  selector: 'app-value-added-list',
  templateUrl: './value-added-list.component.html',
  styleUrls: ['./value-added-list.component.scss']
})

export class ValueAddedListComponent implements OnInit {
  today: number = Date.now();
  valueAddedds: ValueAdded[];
  filteredValueAddedds: ValueAdded[];

  bundles: Bundle[];
  filteredBundles: Bundle[];

  img_url = `${this.apiEndpoint}/`;
  types = ['All', 'Service', 'Bundle'];
  selectedType = 'All';

  // Permission Feature
  currentUser: any;
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };

  constructor(
    private readonly router: Router,
    private readonly valueService: PgValueAddedService,
    private readonly bundleService: PgBundleService,
    private dialog: MatDialog,
    private readonly toastr: ToastrService,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    public location: Location,
    private currentUserService: CurrentUserService,
    private readonly bundleValueAddedService: PgBundleValueAddedService,
  ) { }

  async ngOnInit() {
    try {
      const currentUser = await this.currentUserService.get();
      this.permission = CurrentUserService.canFeature(currentUser, 'tariff_valueadded');
      this.getAllService();
    } finally {
    }
  }

  private getAllService() {
    forkJoin(
      this.valueService.get({operation_type: 'Carpark'}),
      this.bundleService.get()
    ).subscribe(res => {
      let [values, bundles] = res;
      this.valueAddedds = values;
      this.filteredValueAddedds = values;
      this.bundles = bundles;
      this.filteredBundles = bundles;
    });
  }

  public onBack() {
    this.location.back();
  }

  public onAddValue() {
    this.router.navigate(['tariff/value-added/new']);
  }

  public onAddBundle() {
    this.router.navigate(['tariff/bundle/new']);
  }

  public onEdit(servcie: ValueAdded) {
    this.router.navigate([`tariff/value-added/${servcie.id}`]);
  }

  public onRemove(service: ValueAdded) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: "Confirm",
        message: 'This action is not reversible! Are you sure you want to delete ?',
        btnOk: "Ok",
        btnCancel: "Cancel"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let observable = [];
        observable.push(this.bundleValueAddedService.deleteByService(service.id));
        let service_obserable = this.valueService.delete(service);

        let finalObservable;
        if(observable.length) {
          finalObservable = forkJoin(observable).flatMap( res => {
            return forkJoin(service_obserable);
          });
        } else  {
          finalObservable = service;
        }
        let delete_observable = [];
        delete_observable.push(finalObservable);

        forkJoin(delete_observable).subscribe(res => {
          this.toastr.success(
              "The Value Added is deleted successfully!",
              "Success!"
            );
            this.getAllService();
        },
        (err) => {
          if (err.message) {
            let errorMessage = err.message;
            if ( err.message.indexOf('Http failure') >= 0)  {
               errorMessage = 'This Service is in used by other section and couldn\'t be deleted';
            }
            this.toastr.error(errorMessage, 'Error!');
          }
        });
      }
    });
  }

  public onEditBundle(servcie: Bundle) {
    this.router.navigate([`tariff/bundle/${servcie.id}`]);
  }

  public onRemoveBundle(service: Bundle) {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: "Confirm",
        message: 'This action is not reversible! Are you sure you want to delete ?',
        btnOk: "OK",
        btnCancel: "Cancel"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let observable = [];
        observable.push(this.bundleValueAddedService.deleteByService(service.id));
        let bundle_obserable = this.bundleService.delete(service);

        let finalObservable;
        if(observable.length) {
          finalObservable = forkJoin(observable).flatMap( res => {
            return forkJoin(bundle_obserable);
          });
        } else  {
          finalObservable = service;
        }
        let delete_observable = [];
        delete_observable.push(finalObservable);

        forkJoin(delete_observable).subscribe(res => {
          this.toastr.success(
              "The Bundle is deleted successfully!",
              "Success!"
            );
            this.getAllService();
        },
        (err) => {
          if (err.message) {
              let errorMessage = err.message;
              if ( err.message.indexOf('Http failure') >= 0)  {
                 errorMessage = 'This Service is in used by other section and couldn\'t be deleted';
              }
              this.toastr.error(errorMessage, 'Error!');
          }
        });
      }
    });
  }

  public onChangeType(value: string) {
    this.selectedType = value;
  }

  public applyFilterService(filter: string) {
    filter = filter.trim().toLowerCase();
    this.filteredValueAddedds = this.valueAddedds.filter( v => {
      return (v.service_name_en.toLocaleLowerCase().indexOf(filter) >= 0);
    });
    this.filteredBundles = this.bundles.filter( v => {
      return (v.bundle_name_en.toLocaleLowerCase().indexOf(filter) >= 0);
    });
  }
}