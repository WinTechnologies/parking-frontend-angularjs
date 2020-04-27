import { Page } from './page.model';

/**
 * An array of data with an associated page object used for paging
 */
export class PagedEmployee<T> {
  data = new Array<T>();
  page = new Page();
}