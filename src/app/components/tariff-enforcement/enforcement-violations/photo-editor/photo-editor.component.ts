import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CropperSettings } from 'ng2-img-cropper';
import { UploadService } from '../../../../services/upload.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})

export class PhotoEditorComponent implements OnInit {
  cropperSettings = new CropperSettings();
  dataImage: any;
  baseUrl: string = this.apiEndpoint + '/';
  public options: any;

  constructor(
    public dialogRef: MatDialogRef<PhotoEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    private uploadService: UploadService
  ) { }

  ngOnInit() {
    this.cropperSettings.width = 150;
    this.cropperSettings.height = 150;
    this.cropperSettings.croppedWidth = 150;
    this.cropperSettings.croppedHeight = 150;
    this.cropperSettings.canvasWidth = 300;
    this.cropperSettings.canvasHeight = 300;
    this.dataImage = {};

    this.options = {
      app: 'web',
      section: 'employees',
      sub: ''
    };
  }

  cancelDialog(): void {
    this.dialogRef.close();
  }
  saveImage(): void {
    if (this.dataImage.image) {
      const imageBlob = this.uploadService.dataURItoBlob(this.dataImage.image);
      this.uploadService.uploadBlobImage(imageBlob, this.options).subscribe(result => {
        this.dialogRef.close('/' + result );
      });
    }
  }
}