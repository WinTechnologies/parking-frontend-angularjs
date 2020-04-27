import { Injectable } from '@angular/core';
import { Job } from '../shared/classes/job';
import { ApiService } from '../core/services/api.service';
import { Subject } from 'rxjs';

@Injectable()
export class JobService {
    closeSubject = new Subject();
    selectRowSubject = new Subject();

    constructor(
        private apiService: ApiService,
    ) { }

    private jobsUrl = `/jobs`;

    public getJobsByFields(params?): Promise<Job[]> {
        return this.apiService.get(this.jobsUrl, params);
    }

    public getFtpImage(imageUrl: string) {
        return this.apiService.get('/jobs/oses-image', { url: imageUrl });
    }

    closeDetailBox() {
        this.closeSubject.next();
    }

    selectRow(column: any) {
        this.selectRowSubject.next(column);
    }

    updateByJobNumber(jobNumber, body) {
        return this.apiService.put('/jobs/' + jobNumber, body);
    }
}
