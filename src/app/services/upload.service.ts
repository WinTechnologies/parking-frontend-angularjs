
import { map } from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';


const httpOptions = {
    headers: new HttpHeaders()
};
@Injectable()
export class UploadService {

    private uploadUrl = `${this.apiEndpoint}/upload`;
    private ftpUrl = `${this.apiEndpoint}/ftp`;
    // private uploadUrl = `http://127.0.0.1:8003/api/upload`;

    constructor(
        private http: HttpClient,
        @Inject('API_ENDPOINT') private apiEndpoint: string
    ) { }

    uploadBlobImage(blobImage: any, options): Observable<any> {
        const formData: FormData = new FormData();

        const app = options.app;
        const section = options.section;
        const sub = options.sub;
        formData.append('upload', blobImage, 'picture.png');
        return this.http.post<string>(`${this.uploadUrl}/one/${app}/${section}/${sub}`, formData);
    }

    dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);

        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const bb = new Blob([ab]);
        return bb;
    }

    uploadOneByPurpose(files: Array<File>, options: any): Observable<string> {
        const formData: any = new FormData();
        const app = options.app;
        const section = options.section;
        const sub = options.sub;

        const file = files[0] || [];
        formData.append('upload', file, file['name']);
        return this.http.post<string>(`${this.uploadUrl}/one/${app}/${section}/${sub}`, formData);
    }

    uploadManyByPurpose(files: Array<File>, options: any): Observable<string[]> {
        const formData: any = new FormData();
        const app = options.app;
        const section = options.section;
        const sub = options.sub;

        files = files || [];
        files.forEach(file => {
            formData.append('uploads', file, file['name']);
        });

        return this.http.post<string[]>(`${this.uploadUrl}/many/${app}/${section}/${sub}`, formData);
    }

    uploadToFtp(base64): Observable<string> {
        return this.http.post<string>(`${this.ftpUrl}/upload-image/`, { base64: base64});
    }

    replaceOneByPurpose(inputFile: File, originalImageUrl: string): Observable<string> {
        const formData: any = new FormData();
        const file = inputFile || [];
        formData.append('upload', file, file['name']);

        originalImageUrl = originalImageUrl.split('/').join('%20');
        return this.http.post<string>(`${this.uploadUrl}/replace/${originalImageUrl}`, formData);
    }

    replaceToFtp(blob, originalImageUrl): Observable<string> {
        const formData: any = new FormData();
        const file = blob || [];
        formData.append('upload', file, file['name']);
        formData.append('original_image_url', originalImageUrl);

        return this.http.post<string>(`${this.ftpUrl}/replace-image`, formData);
    }
}
