import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilterPipe'
})
export class SearchFilterPipe implements PipeTransform {

  transform(value: any[], term: string): any[] {
    if (value) {
      return value.filter((x: any) => x.fullname.toLowerCase().startsWith(term.toLowerCase()) || x.position.toLowerCase().startsWith(term.toLowerCase()) );
    }
  }
}
