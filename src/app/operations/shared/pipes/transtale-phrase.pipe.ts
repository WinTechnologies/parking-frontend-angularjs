import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'transtalePhrase'
})
export class TranstalePhrasePipe implements PipeTransform {
  translation: string;
  constructor(public translate: TranslateService) {
  }

  transform(value: any, args: string) {
    this.translate.use(args);
    if (!value) {
      return '';
    }
    return this.translate.get([value]).toPromise().then(res => {
      this.translate.use('en');
      return res[value];
    });
  }

}
