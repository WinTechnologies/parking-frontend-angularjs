import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Job } from '../../../../shared/classes/job';
import { JobService } from '../../../../services/job.service';
import { ContraventionService } from '../../../../services/contravention.service';
import { FormControl, FormGroup } from '@angular/forms';
import { PgProjectsService } from '../../../../components/projects/services/projects.service';
import { MqttService } from 'ngx-mqtt';
import { Subject } from 'rxjs';
import { config } from '../../../../../config';
import { takeUntil } from 'rxjs/operators';
import { Job_List_Fields, JobStatus } from '../../fixtures/job.fixture';
import { LoaderService } from '../../../../services/loader.service';
import { Filter, MatTableFilterService } from '../../../../services/mat-table-filter.service';
import { TableColumnsEditModalComponent } from '../../../../shared/components/table-columns-edit-modal/table-columns-edit-modal.component';
import * as i18nIsoCountries from 'i18n-iso-countries';
import { CommonService } from '../../../../services/common.service';

@Component({
    selector: 'app-job',
    templateUrl: './job.component.html',
    styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit, OnDestroy {
    private sort: MatSort;
    @ViewChild(MatSort) set matSort(ms: MatSort) {
        this.sort = ms;
        this.setDataSourceAttributes();
    }

    @ViewChild(MatPaginator) paginator: MatPaginator;
    jobs: Array<Job>;
    jobsOrigin: Array<Job>;
    selectedJob: Job;
    public isDetailOn = false;
    showFields = [];
    tableFields = [];
    displayedColumns = Job_List_Fields;
    isLoading = false;

    jobSearchForm: FormGroup;
    projects: any[];
    project_id: any;
    from = new Date();
    to = new Date();

    filterValue = '';
    mqttTopics = config.mqttTopics.job;

    dataSource: any;
    filter: Filter<any>;
    selectedRowIndex: number = -1;
    private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
    public refreshCount = 0;
    public pageSize: number = 10;
    public jobList: any[];
    displayedColumns1: string[] = [];
    previousIndex: number;
    statusList = JobStatus;

    constructor(
        private jobService: JobService,
        private projectService: PgProjectsService,
        private mqttService: MqttService,
        private dialog: MatDialog,
        private loaderService: LoaderService,
        private contraventionService: ContraventionService,
        private filterService: MatTableFilterService,
        private commonService: CommonService,
    ) {
        this.dataSource = new MatTableDataSource();
        this.filter = this.filterService.createFilter(this.dataSource);

        contraventionService.columnSubject.subscribe(
            (columns: any) => {
                this.tableFields = columns.filter(field => field.isShow);
                this.setDisplayedColumns(this.tableFields);
            });

        jobService.closeSubject.subscribe(res => {
            this.isDetailOn = false;
        });
    }

    async ngOnInit() {
        Object.values(this.mqttTopics).forEach(topic => {
            this.mqttService.observe(topic)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((message) => this.handleLiveUpdate(topic, message));
        });

        try {
            this.loaderService.enable();
            this.displayedColumns.forEach(field => {
                this.showFields.push(
                    {
                        name: field.name,
                        label: field.label,
                        isShow: field.isShow,
                    }
                );
            });
            this.tableFields = this.showFields.filter(field => field.isShow);

            this.projects = await this.projectService.getAllUserProjects().toPromise();
            this.initForm();
            this.onSubmit();
            this.setDisplayedColumns(this.tableFields);
        } finally {
            this.loaderService.disable();
        }
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.unsubscribe();
    }

    initForm() {
        this.jobSearchForm = new FormGroup({
            project: new FormControl('all'),
            from: new FormControl(this.from),
            to: new FormControl(this.to),
        });
    }

    async onSubmit() {
        const from = this.convertToISOString(this.jobSearchForm.value.from, false);
        const to = this.convertToISOString(this.jobSearchForm.value.to, true);
        const params = { from, to };
        if (this.jobSearchForm.value.project !== 'all') {
            params['project_id'] = this.jobSearchForm.value.project;
        }

        try {
            this.loaderService.enable();
            this.isLoading = true;
            this.jobs = await this.jobService.getJobsByFields(params);

            this.dataSource = new MatTableDataSource<Job>(this.jobs);
            this.filter = this.filterService.createFilter(this.dataSource);
            this.jobList = this.jobs;
            this.fetchMatTable(this.jobs);
            this.setDataSourceAttributes();
            this.isLoading = false;
            this.refreshCount = this.refreshCount + 1;
        } catch (e) {
            console.log('JobComponent->onSubmit->error', e);
        } finally {
            this.loaderService.disable();
        }
    }

    fetchMatTable(jobs: Job[]): void {
        this.jobsOrigin = jobs;
        this.applyFilter(this.filterValue);
    }

    public reorderColumns(event) {
        const newValue = this.tableFields[event.newValue];
        const prevValue = this.tableFields[event.prevValue];
        const newIndex = this.showFields.indexOf(newValue);
        const prevIndex = this.showFields.indexOf(prevValue);
        let i = 0;
        this.showFields = this.showFields.map(value => {
            value = i === newIndex ? prevValue : value;
            value = i === prevIndex ? newValue : value;
            i++;
            return value;
        });
        this.tableFields = this.showFields.filter(field => field.isShow);
    }

    public editColumns() {
        const dialogRef = this.dialog.open(TableColumnsEditModalComponent, {
            width: '550px',
            data: {
                showFields: this.showFields,
                originFields: this.displayedColumns,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.showFields = result;
                this.tableFields = this.showFields.filter(field => field.isShow);
            }
        });
    }

    applyFilter(filterValue: string) {
      this.filter.applySimpleFilter(filterValue, this.tableFields.map(f => f.name));
    }

    private convertToISOString(date: Date, byEndOfDay: boolean): string {
        if (byEndOfDay) {
            date.setHours(23, 59, 59, 999);
        } else {
            date.setHours(0, 0, 0, 0);
        }
        return date.toISOString();
    }

    private handleLiveUpdate(topic, message) {
        const jsonMessage = JSON.parse(message.payload.toString());
        switch (topic) {
            case this.mqttTopics.remove:
                this.handleJobRemove(jsonMessage);
                break;
            case this.mqttTopics.create:
                this.handleJobCreate(jsonMessage);
                break;
            case this.mqttTopics.update:
                this.handleJobUpdate(jsonMessage);
                break;
            case this.mqttTopics.start:
                this.handleJobStart(jsonMessage);
                break;
        }
    }

    private handleJobRemove(message) {
        const index = this.jobs.findIndex(job => +job.job_number === +message.id);
        if (index > -1) {
            this.jobs[index].status = message.status;
        }
    }

    private handleJobCreate(message) {
        const createdAt = new Date(message.creation);
        const from = this.convertToISOString(this.jobSearchForm.value.from, false);
        const to = this.convertToISOString(this.jobSearchForm.value.to, true);
        const selectedProject = this.jobSearchForm.value.project;
        if (new Date(from) <= createdAt && new Date(to) >= createdAt && (selectedProject === 'all' || selectedProject === message.project_id)) {
            this.jobs.unshift(message);
            this.fetchMatTable(this.jobs);
        }
    }

    private handleJobUpdate(message) {
        const index = this.jobs.findIndex(job => +job.job_number === +message.job_number);
        if (index > -1) {
            this.updateObjectDetails(this.jobs[index], message);
        }
    }

    private handleJobStart(message) {
        const index = this.jobs.findIndex(job => +job.job_number === +message.id);
        if (index > -1) {
            this.jobs[index].taker_username = message.taker_username;
            this.jobs[index].taker_id = message.taker_id;
            this.jobs[index].status = message.status;
            this.jobs[index].date_start_gmt = message.date_start_gmt;
        }
    }

    updateObjectDetails(source, updated) {
        Object.keys(updated).forEach((field) => {
            if (source.hasOwnProperty(field) && source[field] !== updated[field]) {
                source[field] = updated[field];
            }
        });
    }

    formatDate(datetime) {
        if (datetime !== null && datetime.indexOf('.') > 0 && datetime.indexOf('T')) {
            return datetime.replace('T', ' ').substring(0, datetime.lastIndexOf('.'));
        } else {
            return datetime;
        }
    }

    public unsafePublish(topic: string, message: string): void {
        this.mqttService.unsafePublish(topic, message, { qos: 1, retain: true });
    }

    onRowSelect(row) {
        this.selectedRowIndex = row.job_number;
        this.isDetailOn = true;
        this.selectedJob = row;

        this.jobService.selectRow(row);
    }

    handlePage(pageNumber) {
        const end = (pageNumber + 1) * this.pageSize;
        const start = pageNumber * this.pageSize;
        const part = this.jobList.slice(start, end);
        this.dataSource._updateChangeSubscription();
    }

    refreshPage(event) {
        this.pageSize = event.pageSize;
    }

    setDisplayedColumns(columns) {
        this.displayedColumns1 = [];
        columns.forEach((colunm, index) => {
            colunm.index = index;
            if (colunm.isShow)
                this.displayedColumns1[index] = colunm.name;
        });
    }

    setCategoryClass(cn) {
        const status = cn.status;
        const jobType = cn.job_type;
        let category = '';

        switch (status) {
            // MISSED
            case 'MISSED':
                category = 'missed';
                break;
            // TOWED
            case 'TOWED':
                category = 'towed';
                break;
            // TOW REQUESTED
            case 'TOW REQUESTED':
                category = 'tow-requested';
                break;
            // TOW IN PROGRESS
            case 'TOW IN ROUTE':
                category = 'tow-in-route';
                break;
            // TOW IN POUND
            case 'IN ROUTE TO CARPOUND':
                category = 'in-route-to-car-pound';
                break;
            case 'RELEASED':
                // TOW RELEASED
                if(jobType == 'TOW JOB') {
                    category = 'tow-job-released';
                } else if (jobType == 'DECLAMP JOB') {
                    // DECLAMP DECLAMPED
                    category = 'declamp-released';
                } else if (jobType == 'CLAMP JOB') {
                    category = 'clamp-released';
                }
                break;
            case 'CANCELED':
                // TOW CANCELED
                if(jobType == 'TOW JOB') {
                    category = 'tow-job-canceled';
                } else if(jobType == 'CLAMP JOB') {
                // CLAMP CANCELED
                    category = 'clamp-job-canceled';
                } else if(jobType == 'DECLAMP JOB') {
                // DECLAMP CANCELED
                    category = 'declamp-job-canceled';
                }
                break;
            // CLAMP REQUESTED
            case 'CLAMP REQUESTED':
                category = 'clamp-requested';
                break;
            // CLAMP IN PROGRESS
            case 'CLAMP IN ROUTE':
                category = 'clamp-in-progress';
                break;
            // CLAMPED
            case 'CLAMPED':
                category = 'clamped';
                break;
            // DECLAMP REQUESTED
            case 'DECLAMP REQUESTED':
                category = 'declamp-requested';
                break;
            // DECLAMP IN PROGRESS
            case 'DECLAMP IN ROUTE':
                category = 'declamp-in-route';
                break;
        }
        return category;
    }

    dragStarted(event: CdkDragStart, index: number) {
        this.previousIndex = index;
    }

    dropListDropped(event: CdkDropList, index: number) {
        if (event) {
            moveItemInArray(this.tableFields, this.previousIndex, index);
            this.setDisplayedColumns(this.tableFields);
        }
    }

    onContextMenu(event: MouseEvent) {
        event.preventDefault();
        this.contraventionService.contextMenu(event);
    }
    setDataSourceAttributes() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    formatTimeWithGmt = (datetime, gmt) => {
        return this.commonService.formatTimeWithGmt(datetime, gmt);
    }
}
