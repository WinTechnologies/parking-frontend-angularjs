import {Component, Input, OnInit} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-promotion-values',
  templateUrl: './promotion-values.component.html',
  styleUrls: ['./promotion-values.component.scss']
})
export class PromotionValuesComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() canUpdate = false;

  optionalControls = ['discount_value', 'discount_percetage', 'credit_value'];

  // TODO:: It should be fixed later
  instanceValues = ['Single', 'Multiple'];

  constructor() { }

  ngOnInit() {
    this.optionalControls.forEach((control) => {
      if (this.formGroup.get(control).value !== null ) {
        this.changeControl(control, this.formGroup.get(control).value);
      }
    });
  }

  changeControl(controlName: string, value: number): void {
    const controls = this.optionalControls.slice(0);
    controls.splice(controls.indexOf(controlName), 1);
    if (value !== null) {
      this.handleControls(controls, true);
    } else {
      this.handleControls(controls);
    }
  }

  checkUnlimited(event): void {
    this.formGroup.patchValue({unlimited: event.checked, nbr_instances: event.checked ? -1 : 0});
  }

  changeInstance(event): void {
    this.formGroup.patchValue({unlimited: event && event === -1});
    if (event && event === -1) {
      this.handleControls(['nbr_instances'], true);
    } else {
      this.handleControls(['nbr_instances']);
    }
  }

  private handleControls(controlNames: string[], isDisable = false): void {
    setTimeout(() => {
      controlNames.forEach(controlName => {
        if (isDisable) {
          this.formGroup.get(controlName).disable();
        } else {
          this.formGroup.get(controlName).enable();
        }
      });
    });
  }

}
