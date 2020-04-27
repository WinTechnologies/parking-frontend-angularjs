
import {map} from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { Product} from '../shared/classes/product';
import { Observable} from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';

//
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ProductService {
    private productsUrl = `${this.apiEndpoint}/products`;



    constructor(
        private http: HttpClient,
        @Inject('API_ENDPOINT') private apiEndpoint: string
    ) { }

    /** GET products from the server */
    getProducts(projectId: number = null): Observable<Product[]> {
      const options: any = {};
      if (projectId) {
        options.project_id = projectId;
      }

      return  this.http.get<Product[]>(this.productsUrl, {params: options}).pipe(
            map(response => response.map(x => new Product (
        x.id, x.name, x.client_type , x.price_type ,
        x.begin_date , x.end_date , x.project_id ,
        x.site_id , x.time_unit, x.time_segments , x.percent , x.payment_methods ) )));
    }

    /** GET product from the server */
    getProduct(product_id) {
        return this.http.get(this.productsUrl + '?id=' + product_id);
    }

    /** PUT: update the product on the server */
    updateProduct (product: Product): Observable<any> {
        return this.http.put(this.productsUrl, product, httpOptions);
    }

    /** POST: add a new product to the server */
    addProduct (product: Product): Observable<Product> {
        return this.http.post<Product>(this.productsUrl, product, httpOptions);
    }

    /** DELETE: delete the product from the server */
    deleteProduct(product: Product | string): Observable<Product> {
        const id = typeof product === 'string' ? product : product.id;
        console.log('2: ', id);
        const url = `${this.productsUrl}`;

        let hopt = httpOptions;
        hopt['body'] = {
          id: id
        };
        console.log('!: ', hopt);
        return this.http.delete<Product>(url, hopt);
    }

    getNotAvailableSegments(site_id) {
      return this.http.get(this.productsUrl + '/interval_time_by_site_id/?site_id=' + site_id);
    }

    getOverview(site_id, client_type, start_date, end_date) {
      return this.http.get(this.productsUrl + '/calendar_by_site_id/?site_id=' + site_id + '&client_type=' + client_type + '&start=' + start_date + '&end=' + end_date);
    }
}
