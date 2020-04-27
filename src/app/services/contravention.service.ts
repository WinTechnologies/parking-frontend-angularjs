import { Injectable } from '@angular/core';
import { Contravention } from '../shared/classes/contravention';
import { ApiService } from '../core/services/api.service';
import { Subject } from 'rxjs';

@Injectable()
export class ContraventionService {
    contextSubject = new Subject();
    columnSubject = new Subject();
    closeSubject = new Subject();
    selectRowSubject = new Subject();

    private apiUrl = `/contravention`;

    constructor(
        private apiService: ApiService,
    ) { }

    getByFields(params?: any): Promise<Contravention[]> {
        return this.apiService.get(this.apiUrl, params);
    }

    getStatusCodes() {
        return this.apiService.get(this.apiUrl + '/status-codes');
    }

    getFtpImage(imageUrl: string) {
        return this.apiService.get(this.apiUrl + '/oses-image', { url: imageUrl });
    }

    contextMenu(event: any) {
        this.contextSubject.next(event);
    }

    setFields(columns: any) {
        this.columnSubject.next(columns);
    }

    closeDetailBox() {
        this.closeSubject.next();
    }

    selectRow(column: any) {
        this.selectRowSubject.next(column);
    }

    updateByCnNumber(cnNumber,body) {
        return this.apiService.put(this.apiUrl + '/' + cnNumber, body);
    }

    get(params: any = {}): Promise<Contravention[]> {
        const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
        const url = `${this.apiUrl}?${queryString}`;
        return this.apiService.get(url);
    }

    update(params: any= {}): Promise<any> {
        const url = `${this.apiUrl}/${params.cn_number_offline}`;
        return this.apiService.put(url, params);
    }
}
