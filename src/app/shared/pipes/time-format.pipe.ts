import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name : 'timeFormat',
})
export class TimeFormat implements PipeTransform {
  transform(value: string, term?: string): string {
    if (value && value.length > 5) {
      return value.substring(0, 5);
    } else {
      return value;
    }
  }
}
