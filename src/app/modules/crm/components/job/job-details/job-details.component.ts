import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { KeyValue } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { Job_Details_Fields } from '../../../fixtures/job.fixture';
import { JobService } from '../../../../../services/job.service';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { JobViolationModalComponent } from '../violation-map-modal/violation-map.component';
import * as i18nIsoCountries from 'i18n-iso-countries';
import { Job } from '../../../../../shared/classes/job';
import { Subject } from 'rxjs';
import { ConfirmationDialogService } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.service';
import { UploadService } from '../../../../../services/upload.service';
import { CommonService } from '../../../../../services/common.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-job-details',
    templateUrl: './job-details.component.html',
    styleUrls: ['./job-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class JobDetailsComponent implements OnInit {
    originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
        return 0;
    }

    // Order by ascending property value
    valueAscOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
        return a.value.localeCompare(b.value);
    }

    // Order by descending property key
    keyDescOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
        return a.key > b.key ? -1 : (b.key > a.key ? 1 : 0);
    }

    @Input() selectedJob: any;

    violationPictures = [];
    job: Job;
    Job_Details_Fields = Job_Details_Fields;
    uploadBase = environment.apiBase;
    galleryOptions: NgxGalleryOptions[];
    violationLocation: string;

    ngUnsubscribe: Subject<void> = new Subject<void>();
    baseUrl = environment.apiBase;
    sendBy: string;
    base64: string;
    statusList: any[];
    gmt: string;

    galleryImages: NgxGalleryImage[];
    defectPictures: NgxGalleryImage[];
    clampPictures: NgxGalleryImage[];
    declampPictures: NgxGalleryImage[];
    towPictures: NgxGalleryImage[];

    violationPicUrls: string[];
    clampPicUrls: string[];
    declampPicUrls: string[];
    towPicUrls: string[];
    defectPicUrls: string[];


    constructor(
        private jobService: JobService,
        private dialog: MatDialog,
        private uploadService: UploadService,
        private confirmationDialogService: ConfirmationDialogService,
        private readonly toastr: ToastrService,
        private readonly commonService: CommonService
    ) {
        jobService.selectRowSubject.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((res: Job) => {
                this.job = res;
                this.statusList = [];
                this.setJobDetail();
            });
        // Save
        commonService.saveImageSubject.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((info: Array<Object>) => {
                let file: any = info[0];
                let originalImageUrl: any = info[1];

                // MAPS
                if (this.sendBy === 'MAPS') {
                    this.uploadService.replaceOneByPurpose(file, originalImageUrl)
                        .pipe(takeUntil(this.ngUnsubscribe))
                        .subscribe(uploaded_url => {
                            this.toastr.success('Successfully updated!', 'Success!');
                        }, error => {
                            this.toastr.error('Image upload has been failed.', 'Error!');
                        });
                } else {
                    // OSES
                    const blob = this.commonService.dataURItoBlob(this.base64);

                    this.uploadService.replaceToFtp(blob, originalImageUrl)
                        .subscribe(uploaded_url => {
                            this.toastr.success('Successfully updated!', 'Success!');
                        }, error => {
                            this.toastr.error('Image upload has been failed to the FTP.', 'Error!');
                        });
                }
            });
    }

    ngOnInit() {
        this.job = this.selectedJob;

        this.galleryOptions = [
            {
                width: '100%',
                height: '400px',
                imageAnimation: NgxGalleryAnimation.Slide,
                thumbnails: false,
                previewZoom: true,
                previewRotate: true,
                previewFullscreen: true,
                actions: [
                    { icon: 'fa fa-save', onClick: this.saveImage.bind(this), titleText: 'Save' }
                ]
            },
            // max-width 800
            {
                breakpoint: 800,
                width: '100%',
                height: '600px',
                imagePercent: 80,
                thumbnailsPercent: 20,
                thumbnailsMargin: 20,
                thumbnailMargin: 20
            },
            // max-width 400
            {
                breakpoint: 400,
                preview: false
            }
        ];

        this.setJobDetail();
    }

    getFlagClass() {
        i18nIsoCountries.registerLocale(require("i18n-iso-countries/langs/en.json"));
        const country = (this.job.plate_country == 'Saudi Arab') ? 'Saudi Arabia' : this.job.plate_country;
        const code = i18nIsoCountries.getAlpha2Code(country, 'en');
        const flag = 'flag-icon-' + code;
        return flag.toLowerCase();
    }

    getStatusName(job) {
        const status = job.status;
        const jobType = job.job_type;
        let category = '';

        switch (status) {
            // MISSED
            case 'MISSED':
                category = 'MISSED';
                break;
            // TOWED
            case 'TOWED':
                category = 'TOWED';
                break;
            // TOW REQUESTED
            case 'TOW REQUESTED':
                category = 'TOW REQUESTED';
                break;
            // TOW IN PROGRESS
            case 'TOW IN ROUTE':
                category = 'TOW IN PROGRESS';
                break;
            // TOW IN POUND
            case 'IN ROUTE TO CARPOUND':
                category = 'TOW IN POUN';
                break;
            case 'RELEASED':
                // TOW RELEASED
                if (jobType === 'TOW JOB') {
                    category = 'TOW RELEASED';
                } else if (jobType === 'DECLAMP JOB') {
                    // DECLAMP DECLAMPED
                    category = 'DECLAMPED';
                } else if (jobType === 'CLAMP JOB') {
                    category = 'CLAMP RELEASED';
                }
                break;
            case 'CANCELED':
                // TOW CANCELED
                if (jobType === 'TOW JOB') {
                    category = 'TOW JOB CANCELED';
                } else if (jobType === 'CLAMP JOB') {
                    // CLAMP CANCELED
                    category = 'CLAMP JOB CANCELED';
                } else if (jobType === 'DECLAMP JOB') {
                    // DECLAMP CANCELED
                    category = 'DECLAMP JOB CANCELED';
                }
                break;
            // CLAMP REQUESTED
            case 'CLAMP REQUESTED':
                category = 'CLAMP REQUESTED';
                break;
            // CLAMP IN PROGRESS
            case 'CLAMP IN ROUTE':
                category = 'CLAMP IN PROGRESS';
                break;
            // CLAMPED
            case 'CLAMPED':
                category = 'CLAMPED';
                break;
            // DECLAMP REQUESTED
            case 'DECLAMP REQUESTED':
                category = 'DECLAMP REQUESTED';
                break;
            // DECLAMP IN PROGRESS
            case 'DECLAMP IN ROUTE':
                category = 'DECLAMP IN PROGRESS';
                break;
        }
        return category;
    }

    formatDate(datetime) {
        if (datetime !== null && datetime.indexOf('.') > 0 && datetime.indexOf('T')) {
            return datetime.replace('T', ' ').substring(0, datetime.lastIndexOf('.'));
        } else {
            return datetime;
        }
    }

    onMapView() {
        const dialogRef = this.dialog.open(JobViolationModalComponent, {
            width: '760px',
            data: {
                job: this.selectedJob,
            }
        });
    }

    onClose() {
        this.jobService.closeDetailBox();
    }

    saveImage(event, index): void {
        this.confirmationDialogService.confirm('Please confirm', 'Do you really want to save the rotated image?')
            .then((confirmed) => {
                // Select the gallery: violation-pictures, defect-pictures, job-status-pictures
                let selectedImage:any;
                const paths = event.path;
                // The 8th element always is the gallery wrapper, hence the index is 8
                const galleryWrapper = paths[8] as HTMLElement;
                let selectedGalleryType = '';

                let className = '';
                if (galleryWrapper.classList.contains('violation-pictures')) {
                    selectedImage = this.galleryImages[index];
                    selectedGalleryType = 'violation';
                    className = 'violation-pictures';
                } else if (galleryWrapper.classList.contains('defect-pictures')) {
                    selectedImage = this.defectPictures[index];
                    selectedGalleryType = 'defect';
                    className = 'defect-pictures';
                } else if (galleryWrapper.classList.contains('clamp-pictures')) {
                    selectedImage = this.clampPictures[index];
                    selectedGalleryType = 'clamp';
                    className = 'clamp-pictures';
                } else if (galleryWrapper.classList.contains('declamp-pictures')) {
                    selectedImage = this.declampPictures[index];
                    selectedGalleryType = 'declamp';
                    className = 'declamp-pictures';
                } else if (galleryWrapper.classList.contains('tow-pictures')) {
                    selectedImage = this.towPictures[index];
                    selectedGalleryType = 'tow';
                    className = 'tow-pictures';
                }

                const galleryWrapperObj = document.getElementsByClassName(className);
                const galleryPreview = galleryWrapperObj[0].getElementsByClassName('ngx-gallery-preview-img-wrapper');
                const selectedImgTag = galleryPreview[0].getElementsByClassName('ngx-gallery-active')[0] as HTMLElement;
                const transform = this.commonService.getTransformedStyle(selectedImgTag.style.transform);
                const scale = transform.scale;
                const deg = parseInt(transform.rotate);

                this.commonService.rotateByRadian(selectedImage.big, scale, deg, function (resetBase64Image) {
                    this.base64 = resetBase64Image;
                    let tempGalleryImages:any;

                    switch (selectedGalleryType) {
                        case 'violation':
                            tempGalleryImages = this.galleryImages;
                            this.galleryImages = [];
                            break;
                        case 'defect':
                            tempGalleryImages = this.defectPictures;
                            this.defectPictures = [];
                            break;
                        case 'clamp':
                            tempGalleryImages = this.clampPictures;
                            this.clampPictures = [];
                            break;
                        case 'declamp':
                            tempGalleryImages = this.declampPictures;
                            this.declampPictures = [];
                            break;
                        case 'tow':
                            tempGalleryImages = this.towPictures;
                            this.towPictures = [];
                            break;
                    }

                    tempGalleryImages.map((image, i) => {
                        let gallery;
                        if (i === index) {
                            gallery = {
                                small: selectedImage.small,
                                medium: resetBase64Image,
                                big: resetBase64Image
                            }
                        } else {
                            gallery = image;
                        }

                        switch (selectedGalleryType) {
                            case 'violation':
                                this.galleryImages.push(gallery);
                                break;
                            case 'defect':
                                this.defectPictures.push(gallery);
                                break;
                            case 'clamp':
                                this.clampPictures.push(gallery);
                                break;
                            case 'declamp':
                                this.declampPictures.push(gallery);
                                break;
                            case 'tow':
                                this.towPictures.push(gallery);
                                break;
                        }
                    });

                    let originalPath: string = selectedImage.small ? selectedImage.small.toString() : '';
                    originalPath = originalPath.replace(this.baseUrl + '/', '');
                    this.commonService.urltoFile(resetBase64Image, originalPath).then(file => {
                        // Upload the rotated image with the base64 format
                        let originalImageUrl = '';

                        switch (selectedGalleryType) {
                            case 'violation':
                                originalImageUrl = this.violationPicUrls[index];
                                break;
                            case 'defect':
                                originalImageUrl = this.defectPicUrls[index];
                                break;
                            case 'clamp':
                                originalImageUrl = this.clampPicUrls[index];
                                break;
                            case 'declamp':
                                originalImageUrl = this.declampPicUrls[index];
                                break;
                            case 'tow':
                                originalImageUrl = this.towPicUrls[index];
                                break;
                        }

                        originalImageUrl = originalImageUrl.replace(`${this.baseUrl}/`,'');
                        this.commonService.saveImage([file, originalImageUrl]);
                    });
                }.bind(this));
            }).catch(() => { });
    }

    setJobDetail() {
        this.violationLocation = `${this.job.street_name_en}, ${this.job.intersection_name_en}`;
        this.sendBy = this.job.sent_by;
        // Violation Pictures
        this.getPictures(this.job.violation_pictures, 'violation');
        // Defect Pictures
        this.getPictures(this.job.defect_pictures, 'defect');
        // Clamp Pictures
        this.getPictures(this.job.clamp_pictures, 'clamp');
        // Declamp Pictures
        this.getPictures(this.job.declamp_pictures, 'declamp');
        // Tow Pictures
        this.getPictures(this.job.tow_pictures, 'tow');

        this.gmt = this.job.gmt;

        if (this.job.history) {
            this.statusList = this.commonService.jsonToArray(this.job.history);
        }
    }

    createLabel(str) {
        return this.commonService.createLabel(str);
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    formatTimeWithGmt = (datetime) => {
        return this.commonService.formatTimeWithGmt(datetime, this.gmt);
    }

    getPictures(pictureColumn, status) {
        let promise = [];
        let pictures = [];

        if (pictureColumn) {
            pictures.push(
                ...pictureColumn.split(',')
            );
        }

        for (let index in pictures) {
            promise.push(this.sendBy === 'OSES' ? this.commonService.defineOsesImage(pictures[index]) : this.commonService.defineImageUrl(pictures[index]));
        }

        let galleryPic = [];
        return Promise.all(promise)
            .then(images => {
                images.map(image => {
                    galleryPic.push({
                        small: image,
                        medium: image,
                        big: image
                    });

                    switch (status) {
                        case 'violation':
                            this.galleryImages = galleryPic;
                            this.violationPicUrls = pictures;
                            break;
                        case 'defect':
                            this.defectPictures = galleryPic;
                            this.defectPicUrls = pictures;
                            break;
                        case 'clamp':
                            this.clampPictures = galleryPic;
                            this.clampPicUrls = pictures;
                            break;
                        case 'declamp':
                            this.declampPictures = galleryPic;
                            this.declampPicUrls = pictures
                            break;
                        case 'tow':
                            this.towPictures = galleryPic;
                            this.towPicUrls = pictures;
                            break;
                    }
                });
            }).catch(err => {
                console.error('CRM >>> Job >>> Details >>> Pictures', err);
            });
    }
}