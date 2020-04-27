import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[appInputDateFormat]'
})
export class InputDateFormatDirective {

  constructor() { }

  @HostListener('keypress', ['$event']) onKeypress($event) {

      const pattern = /[0-9\/\ ]/;
      const inputChar = String.fromCharCode($event.charCode);

      if (!pattern.test(inputChar)) {
        $event.preventDefault();
      }
  }
}
