import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-parking-image-view',
  templateUrl: './parking-image-view.component.html',
  styleUrls: ['./parking-image-view.component.scss']
})
export class ParkingImageViewComponent implements OnInit {
  // imgFiles: File[];
  imageUrls: string[] = [];
  localFiles: File[] = [];
  selectedIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<ParkingImageViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('API_ENDPOINT') public apiEndpoint: string
  ) {

    this.imageUrls = data.imageUrls;
    this.localFiles = data.localFiles;
  }

  ngOnInit() {
  }

  public onClose(): void {
    this.dialogRef.close();
  }

 /* private createImageFromBlob(image: File, imgUrl: any) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.imgUrls.push(reader.result);
      if (this.imgUrls.length) {
        this.selectedIndex = 0;
      }
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }*/

  public onSelectImage(index: number) {
    this.selectedIndex = index;
  }

  public onRemoveItem(index: number) {

    if (!this.imageUrls[index].startsWith('uploads/') && this.localFiles) {

      this.localFiles.splice(index - ( this.imageUrls.length - this.localFiles.length), 1);
    }
    this.imageUrls.splice(index, 1);
    this.selectedIndex = this.selectedIndex ? this.selectedIndex - 1 : this.selectedIndex;
  }

  public onChanges() {
    // this.dialogRef.close(this.imgFiles);
    this.dialogRef.close({
      imageUrls: this.imageUrls,
      localFiles: this.localFiles?this.localFiles:[],
    });
  }
}
