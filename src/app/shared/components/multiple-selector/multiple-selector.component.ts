import { Component, OnInit, OnDestroy } from '@angular/core';
import { PopoverRef } from '../popover/popover-ref';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './multiple-selector.component.html',
  styleUrls: ['./multiple-selector.component.scss']
})
export class MultipleSelectorComponent implements OnInit, OnDestroy {
  private optionSubscription: Subscription;

  label: string;
  selectAll = false;
  deselectAll = false;
  searchPlaceholder = '';
  availableOptions: any[] = [];
  enabledOptions: any = {};

  public optionSearchCtrl: FormControl = new FormControl();
  public filteredAvailableOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();

  constructor(private popoverRef: PopoverRef) {
    const { label, enabled, available, searchPlaceholder } = this.popoverRef.data;

    this.label = label;
    this.availableOptions = available;
    this.enabledOptions = enabled;
    this.searchPlaceholder = searchPlaceholder || 'Search';

    this.filter();
  }

  ngOnInit() {
    this.optionSubscription = this.optionSearchCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filter();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
    this.optionSubscription.unsubscribe();
  }

  selectAllOptions() {
    this.availableOptions.forEach((availableOption) => {
      this.enabledOptions[availableOption.value] = true;
    });
    this.deselectAll = false;

    this.popoverRef.select(this.enabledOptions);
  }

  deselectAllOptions() {
    this.enabledOptions = {};
    this.selectAll = false;

    this.popoverRef.select(this.enabledOptions);
  }

  changed() {
    this.selectAll = false;
    this.deselectAll = false;

    this.popoverRef.select(this.enabledOptions);
  }

  filter() {
    if (!this.availableOptions) {
      return;
    }
    let search = this.optionSearchCtrl.value;

    if (!search || search.length === 0) {
      this.filteredAvailableOptions.next(this.availableOptions.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    // filter the banks
    this.filteredAvailableOptions.next(
      this.availableOptions.filter(option => option.label.toLowerCase().indexOf(search) > -1)
    );
  }

  close() {
    this.popoverRef.close(this.enabledOptions);
  }
}
