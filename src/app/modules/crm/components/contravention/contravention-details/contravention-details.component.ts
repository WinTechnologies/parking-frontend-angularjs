import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Contravention } from '../../../../../shared/classes/contravention';
import { environment } from '../../../../../../environments/environment';
import { CN_Details_Fields } from '../../../fixtures/contravention.fixture';
import { ContraventionService } from '../../../../../services/contravention.service';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { ViolationMapModalComponent } from '../violation-map-modal/violation-map.component';
import { UploadService } from '../../../../../services/upload.service';
import { ConfirmationDialogService } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../../services/common.service';
import * as i18nIsoCountries from 'i18n-iso-countries';

@Component({
    selector: 'app-contravention-details',
    templateUrl: './contravention-details.component.html',
    styleUrls: ['./contravention-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContraventionDetailsComponent implements OnInit {
    @Input() statusCodesList: any;
    @Input() selectedContravention: any;

    contravention: Contravention;
    statusCodes = [];
    violationPictures = [];
    contraventionImagePath: string;

    baseUrl = environment.apiBase;
    Details_Fields = [];

    galleryOptions: NgxGalleryOptions[];
    galleryImages: NgxGalleryImage[];
    ngUnsubscribe: Subject<void> = new Subject<void>();
    violationLocation: string;
    sendBy: string;
    directCN: boolean;
    base64: string;
    gmt: any;

    constructor(
        private contraventionService: ContraventionService,
        private dialog: MatDialog,
        private uploadService: UploadService,
        private confirmationDialogService: ConfirmationDialogService,
        private commonService: CommonService,
        private readonly toastr: ToastrService
    ) {
        contraventionService.selectRowSubject.pipe(takeUntil(this.ngUnsubscribe))
                                            .subscribe((res: Contravention) => {
                                                this.galleryImages = [];
                                                this.contravention = res;
                                                this.violationLocation = res.street_name_en + ", " + res.intersection_name_en;
                                                this.sendBy = this.contravention.sent_by;
                                                this.gmt = this.contravention.gmt;

                                                this.directCN = this.contravention.evolved_into_cn_at === null ? true : false;
                                                this.Details_Fields = [];
                                                for (let i = 0; i < CN_Details_Fields.length; i++) {
                                                    if (CN_Details_Fields[i].sectionTitle==='Observation Information' && this.directCN) {
                                                        continue;
                                                    }
                                                    this.Details_Fields.push(CN_Details_Fields[i]);
                                                }
                                                this.getViolationPictures();
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
        this.statusCodes = this.statusCodesList;
        this.contravention = this.selectedContravention;
        this.violationLocation = this.contravention.street_name_en + ", " + this.contravention.intersection_name_en;
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
                preview: true
            }
        ];

        this.getViolationPictures();
        this.sendBy = this.contravention.sent_by;
        this.gmt = this.contravention.gmt;
        this.directCN = this.contravention.evolved_into_cn_at === null ? true : false;

        for (let i = 0; i < CN_Details_Fields.length; i++) {
            if (CN_Details_Fields[i].sectionTitle==='Observation Information' && this.directCN) {
                continue;
            }
            this.Details_Fields.push(CN_Details_Fields[i]);
        }
    }

    private getViolationPictures() {
        const violationPictures = [];
        let promise = [];

        if (this.contravention.plate_picture) {
            violationPictures.push(this.contravention.plate_picture);
        }
        if (this.contravention.violation_picture) {
            violationPictures.push(
                ...this.contravention.violation_picture.split(',')
            );
        }

        this.violationPictures = violationPictures;

        for (let index in violationPictures) {
            promise.push(this.sendBy === 'OSES' ? this.commonService.defineOsesImage(violationPictures[index]) : this.commonService.defineImageUrl(violationPictures[index]));
        }

        this.galleryImages = [];

        return Promise.all(promise)
            .then(images => {
                images.map(image => {
                    this.galleryImages.push({
                        small: image,
                        medium: image,
                        big: image
                    });
                });
            }).catch(err => {
                console.error('CRM >>> Contravention >>> Details >>> Violation Picture', err);
            });
    }

    getStatusName(cn) {
        const status = cn.status;
        const is_paid = cn.is_paid;
        const canceled = cn.canceled_by;
        const creation = cn.creation;
        const evolved_into_cn_at = cn.evolved_into_cn_at;
        const observation_time = cn.observation_time;
        const now = new Date().getTime();
        const created_at = new Date(creation).getTime();
        const diff = now - created_at;
        const min = Math.floor(diff / 1000 / 60);

        let cnStatus = '';
        switch (status) {
            // Observation
            case '0':
                if (canceled !== null) {
                    cnStatus = 'Observation Canceled';
                } else {
                    if (evolved_into_cn_at === null && min > observation_time) {
                        cnStatus = 'Observation Ready to Use';
                    } else {
                        cnStatus = 'Observation In Progress';
                    }
                }
                break;
            // contravention
            case '1':
                if (is_paid) {
                    cnStatus = 'Contravention Paid';
                } else {
                    cnStatus = 'Contravention';
                }

                break;
            // Canceled Observation
            case '2':
                cnStatus = 'Observation Canceled';
                break;
            // Observation Contravention
            case '3':
                cnStatus = 'Contravention Observation';
                break;
            // Canceled Contravention
            case '4':
                cnStatus = 'Contravention Canceled';
                break;
            case '5':
                cnStatus = 'Duplicated Contravention';
                break;
        }
        return cnStatus;
    }

    onClose() {
        this.contraventionService.closeDetailBox();
    }

    onMapView() {
        const dialogRef = this.dialog.open(ViolationMapModalComponent, {
            width: '760px',
            data: {
                contravention: this.contravention,
                statusCodes: this.statusCodes
            }
        });
    }

    getFlagClass() {
        i18nIsoCountries.registerLocale(require("i18n-iso-countries/langs/en.json"));
        const country = (this.contravention.plate_country == 'Saudi Arab') ? 'Saudi Arabia' : this.contravention.plate_country;
        const code = i18nIsoCountries.getAlpha2Code(country, 'en');
        const flag = 'flag-icon-' + code;
        return flag.toLowerCase();
    }

    saveImage(event, index): void {
        this.confirmationDialogService.confirm('Please confirm', 'Do you really want to save the rotated image?')
            .then((confirmed) => {
                const selectedImage = this.galleryImages[index];
                const galleryWrapperObj = document.getElementsByClassName("ngx-gallery-preview-img-wrapper");
                const selectedImgTag = galleryWrapperObj[0].getElementsByClassName("ngx-gallery-active")[0] as HTMLImageElement;

                const transform = this.commonService.getTransformedStyle(selectedImgTag.style.transform);
                const scale = transform.scale;
                const deg = parseInt(transform.rotate);

                this.commonService.rotateByRadian(selectedImage.big, scale, deg, function (resetBase64Image) {
                    this.base64 = resetBase64Image;
                    const tempGalleryImages = this.galleryImages;
                    this.galleryImages = [];

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

                        this.galleryImages.push(gallery);
                    });

                    let originalPath: string = selectedImage.small ? selectedImage.small.toString() : '';
                    originalPath = originalPath.replace(this.baseUrl + '/', '');
                    this.commonService.urltoFile(resetBase64Image, originalPath).then(file => {
                        // Upload the rotated image with the base64 format
                        const originalImageUrl = this.violationPictures[index];
                        this.commonService.saveImage([file, originalImageUrl]);
                    });
                }.bind(this));


            }).catch(() => { });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    formatTimeWithGmt = (datetime) => {
        return this.commonService.formatTimeWithGmt(datetime, this.gmt);
    }
}
