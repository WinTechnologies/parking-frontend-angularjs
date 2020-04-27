import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { environment } from '../../environments/environment';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

var rgbHex = /fill: #([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])/gi;

const REGEX = {
    whitespace: /\s+/g,
    urlHexPairs: /%[\dA-F]{2}/g,
    quotes: /"/g,
};

const colorNames = {
    aqua: /#00ffff(ff)?(?!\w)|#0ff(f)?(?!\w)/gi,
    azure: /#f0ffff(ff)?(?!\w)/gi,
    beige: /#f5f5dc(ff)?(?!\w)/gi,
    bisque: /#ffe4c4(ff)?(?!\w)/gi,
    black: /#000000(ff)?(?!\w)|#000(f)?(?!\w)/gi,
    blue: /#0000ff(ff)?(?!\w)|#00f(f)?(?!\w)/gi,
    brown: /#a52a2a(ff)?(?!\w)/gi,
    coral: /#ff7f50(ff)?(?!\w)/gi,
    cornsilk: /#fff8dc(ff)?(?!\w)/gi,
    crimson: /#dc143c(ff)?(?!\w)/gi,
    cyan: /#00ffff(ff)?(?!\w)|#0ff(f)?(?!\w)/gi,
    darkblue: /#00008b(ff)?(?!\w)/gi,
    darkcyan: /#008b8b(ff)?(?!\w)/gi,
    darkgrey: /#a9a9a9(ff)?(?!\w)/gi,
    darkred: /#8b0000(ff)?(?!\w)/gi,
    deeppink: /#ff1493(ff)?(?!\w)/gi,
    dimgrey: /#696969(ff)?(?!\w)/gi,
    gold: /#ffd700(ff)?(?!\w)/gi,
    green: /#008000(ff)?(?!\w)/gi,
    grey: /#808080(ff)?(?!\w)/gi,
    honeydew: /#f0fff0(ff)?(?!\w)/gi,
    hotpink: /#ff69b4(ff)?(?!\w)/gi,
    indigo: /#4b0082(ff)?(?!\w)/gi,
    ivory: /#fffff0(ff)?(?!\w)/gi,
    khaki: /#f0e68c(ff)?(?!\w)/gi,
    lavender: /#e6e6fa(ff)?(?!\w)/gi,
    lime: /#00ff00(ff)?(?!\w)|#0f0(f)?(?!\w)/gi,
    linen: /#faf0e6(ff)?(?!\w)/gi,
    maroon: /#800000(ff)?(?!\w)/gi,
    moccasin: /#ffe4b5(ff)?(?!\w)/gi,
    navy: /#000080(ff)?(?!\w)/gi,
    oldlace: /#fdf5e6(ff)?(?!\w)/gi,
    olive: /#808000(ff)?(?!\w)/gi,
    orange: /#ffa500(ff)?(?!\w)/gi,
    orchid: /#da70d6(ff)?(?!\w)/gi,
    peru: /#cd853f(ff)?(?!\w)/gi,
    pink: /#ffc0cb(ff)?(?!\w)/gi,
    plum: /#dda0dd(ff)?(?!\w)/gi,
    purple: /#800080(ff)?(?!\w)/gi,
    red: /#ff0000(ff)?(?!\w)|#f00(f)?(?!\w)/gi,
    salmon: /#fa8072(ff)?(?!\w)/gi,
    seagreen: /#2e8b57(ff)?(?!\w)/gi,
    seashell: /#fff5ee(ff)?(?!\w)/gi,
    sienna: /#a0522d(ff)?(?!\w)/gi,
    silver: /#c0c0c0(ff)?(?!\w)/gi,
    skyblue: /#87ceeb(ff)?(?!\w)/gi,
    snow: /#fffafa(ff)?(?!\w)/gi,
    tan: /#d2b48c(ff)?(?!\w)/gi,
    teal: /#008080(ff)?(?!\w)/gi,
    thistle: /#d8bfd8(ff)?(?!\w)/gi,
    tomato: /#ff6347(ff)?(?!\w)/gi,
    violet: /#ee82ee(ff)?(?!\w)/gi,
    wheat: /#f5deb3(ff)?(?!\w)/gi,
    white: /#ffffff(ff)?(?!\w)|#fff(f)?(?!\w)/gi,
};

@Injectable()
export class CommonService {
    private ftpApiUri = `/ftp`;
    saveImageSubject = new Subject();
    baseUrl = environment.apiBase;

    constructor(
        private apiService: ApiService,
        private http: HttpClient,
    ) { }

     /**
     * getTransformedStyle() return transformed css style from the class
     */
    getTransformedStyle(transform) {
        return (transform.match(/([\w]+)\(([^\)]+)\)/g) || [])
            //make pairs of prop and value
            .map((it) => { return it.replace(/\)$/, "").split(/\(/) })
            //convert to key-value map/object
            .reduce((m, it) => { return m[it[0]] = it[1], m }, {})
    };

    urltoFile(url, filename, mimeType) {
        mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
        return (fetch(url)
            .then((res) => { return res.arrayBuffer(); })
            .then((buf) => { return new File([buf], filename, { type: mimeType }); })
        );
    }
    /**
     * rotateByRadian() return rotated the image data
     */
    rotateByRadian(srcBase64, scale, deg, callback) {
        let img = new Image();
        img.crossOrigin = 'Anonymous';
        let radians = 0;
        img.onload = function () {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext("2d");
            let sWidth = img.naturalWidth;
            let sHeight = img.naturalHeight;
            let dWidth = sWidth;
            let dHeight = sHeight;
            switch (Math.abs(deg / 90 % 4 * 90)) {
                case 90:
                    radians = Math.PI / 2;
                    dWidth = sHeight
                    dHeight = sWidth;
                    break;
                case 180:
                    radians = Math.PI;
                    break;
                case 270:
                    radians = Math.PI * 3 / 2;
                    dWidth = sHeight
                    dHeight = sWidth;
                    break;
                case 360:
                    radians = 0;
                    break;
                default:
                    radians = 0;
                    break;
            }
            canvas.width = dWidth;
            canvas.height = dHeight;
            radians = (deg < 0) ? -radians : radians;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, dWidth, dHeight);
            ctx.save();
            ctx.translate(Math.abs(sWidth / 2 * Math.cos(radians) + sHeight / 2 * Math.sin(radians)), Math.abs(sHeight / 2 * Math.cos(radians) + sWidth / 2 * Math.sin(radians)));
            ctx.rotate(radians);
            ctx.translate(-sWidth / 2, -sHeight / 2);
            ctx.drawImage(img, 0, 0);
            ctx.restore();
            // export base64
            callback(canvas.toDataURL());
        };

        img.src = srcBase64;
    }
    /**
     * saveImage() subscribes the subject of the save image
     */
    saveImage(base64: any) {
        this.saveImageSubject.next(base64);
    }
    /**
     * dataURItoBlob() returns blob from the data uri
     */
    dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        const byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const _ia = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            _ia[i] = byteString.charCodeAt(i);
        }

        const dataView = new DataView(arrayBuffer);
        const blob = new Blob([dataView], { type: mimeString });
        return blob;
    }

    /**
     * getImageFromFtp() returns url of the OSES image
     */
    getImageFromFtp(imageUrl: string) {
        return this.apiService.get(this.ftpApiUri + '/download-image-as-base64', { url: imageUrl });
    }
    /**
     * defineImageUrl() returns url of the OSES image
     */
    defineOsesImage(picture: string): any {
        return this.getImageFromFtp(picture).then(image => {
            return image;
        });
    }

    /**
     * defineImageUrl() returns image url
     *  Fix the unvalidated url
     */
    defineImageUrl(picture: string): any {
        return new Promise(resolve => {
            const url = picture.replace(/\\/g, '/').trim();
            resolve(`${this.baseUrl}/${url}`);
        });
    }

    /**
     * jsonToArray() returns array from the json
     *  Convert the json to array
     */
    jsonToArray(json){
        const result = [];
        const keys = Object.keys(json);
        keys.map(key =>{
            result.push(json[key]);
        });
        return result;
    }

    /**
     * createLabel() returns label to be displayed based on the column with '_'
     *  Convert table file name to display, i.e: start_date => Start Date
     */
    createLabel(input: string) {
        return input
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * collapseWhitespace() returns collapsed string
     * collapse the white space from the string
     */
    collapseWhitespace(str) {
        return str.trim().replace(REGEX.whitespace, ' ');
    }

    /**
     * dataURIPayload() returns encoded text string
     * Encode Url with the REGEX
     */
    dataURIPayload(string) {
        return encodeURIComponent(string)
          .replace(REGEX.urlHexPairs, this.specialHexEncode);
    }

    /**
     * colorCodeToShorterNames() returns color code
     * gets converted to `%23`, so quite a few CSS named colors are shorter than their equivalent URL-encoded hex codes.
     */
    colorCodeToShorterNames(string) {
        Object.keys(colorNames).forEach(function(key) {
          if (colorNames[key].test(string)) {
            string = string.replace(colorNames[key], key);
          }
        });

        return string;
    }

    /**
     * specialHexEncode() returns lowerCased the encode from the hex
     * Convert Hex encode to the lowerCase
     */
    specialHexEncode(match) {
        switch (match) { // Browsers tolerate these characters, and they're frequent
          case '%20': return ' ';
          case '%3D': return '=';
          case '%3A': return ':';
          case '%2F': return '/';
          default: return match.toLowerCase(); // compresses better
        }
    }

    /**
     * svgToTinyDataUri() returns data uri from the svg content
     * Convert the svg content to the safe data uri
     */
    svgToTinyDataUri(svgString) {
        if (typeof svgString !== 'string') {
          throw new TypeError('Expected a string, but received ' + typeof svgString);
        }
        // Strip the Byte-Order Mark if the SVG has one
        if (svgString.charCodeAt(0) === 0xfeff) { svgString = svgString.slice(1) }

        const body = this.colorCodeToShorterNames(this.collapseWhitespace(svgString))
          .replace(REGEX.quotes, "'");
        return 'data:image/svg+xml,' + this.dataURIPayload(body);
    }

    /**
     * updateFillColor() returns updated fill color of the input and color value as string
     * Update the fill color with the input color based on the rgbHex regular expresssion.
     */
    updateFillColor(input, color) {
        return input.replace(rgbHex, `fill: ${color}`);
    }

    /**
     * formatTimeWithGmt() returns UTC time based on the gmt
     */
    formatTimeWithGmt = (datetime, gmt) => {
        if (datetime && gmt) {
            const timeOffset = gmt.replace('UTC','');
            const length = datetime.length - 5;
            const currentDateTime = datetime.substring(0, length);
            const utcDateTime = moment.utc(currentDateTime).utcOffset(timeOffset).format('YYYY-MM-DD HH:mm:ss');
            return utcDateTime;
        } else {
            return '';
        }
    }

    /**
     * getFileName() return the filename from the full path.
     */
    getFileName = (path) => {
        return path.replace(/^.*[\\\/]/, '');
    }
}