import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { DefaultValueList } from '../../default-value.fixtures';
import { DefaultValueService } from '../../services/default-value.service';
import { ToastrService } from 'ngx-toastr';
import { Countries } from '../../../../../config/countries';
import { UploadService } from '../../../../services/upload.service';

@Component({
  selector: 'app-default-value-detail-modal',
  templateUrl: './default-value-detail-modal.component.html',
  styleUrls: ['./default-value-detail-modal.component.scss']
})
export class DefaultValueDetailModalComponent implements OnInit {

  form: FormGroup;
  list: DefaultValueList;
  defaultValue: any;
  selected_job = 0;
  currentUserId: string;
  fields;
  picture: File[];

  availableCountries = Countries;
  availableJobTypes: any;
  public options: any;

  constructor(
    public dialogRef: MatDialogRef<DefaultValueDetailModalComponent>,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
    private defaultValueService: DefaultValueService,
    private toastrService: ToastrService,
    private readonly uploadService: UploadService,
    @Inject('API_ENDPOINT') public apiEndpoint: string
  ) {
  }

  ngOnInit() {
    this.options = {
      app: 'web',
      section: 'default_values',
      sub: 'incidents'
    };

    this.list = this.matDialogData.list;
    this.defaultValue = this.matDialogData.defaultValue;
    if (this.defaultValue.type_job_id) {
      this.selected_job = this.defaultValue.type_job_id;
    }
    this.availableJobTypes = this.matDialogData.availableJobTypes;
    this.currentUserId = this.matDialogData.employeeId;
    this.buildForm();
  }

  private buildForm() {
    this.picture = [];
    const formControls: any = {};
    if (this.list.name === 'incident') {
      this.fields = this.list.showFields.filter(column => column.name !== 'created_by' && column.name !== 'created_at');
    } else {
      this.fields = this.list.showFields;
    }
    this.fields.forEach(column => {
      const value = this.defaultValue[column.name] === undefined ? null : this.defaultValue[column.name];
      if (column.type === 'codePin') {
        formControls[column.name] = new FormControl(
          {value, disabled: !this.matDialogData.isCreate},
          [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern('[0-9]{1,3}')]);
      } else if (column.type === 'number') {
        formControls[column.name] = new FormControl(
          {value, disabled: !column.editable},
          [Validators.required, Validators.min(column.min), Validators.max(column.max)]);
      } else if (column.type === 'job_type') {
      } else if (column.type === 'img_url') {
        formControls[column.name] = new FormControl({value, disabled: !column.editable});
      } else {
        formControls[column.name] = new FormControl({value, disabled: !column.editable}, [Validators.required]);
      }
    });
    this.form = this.formBuilder.group(formControls);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  async onSubmit() {
    const defaultValue = {...this.defaultValue, ...this.form.value};
    // Should except type_job_name because this value is from join SQL
    delete defaultValue.type_job_name;
    if (!defaultValue.hasOwnProperty('created_by') && this.matDialogData.isCreate && this.list.name === 'incident') {
      defaultValue['created_by'] = this.currentUserId;
    }
    if (!defaultValue.hasOwnProperty('created_by') && !this.matDialogData.isCreate && this.list.name === 'incident') {
      delete defaultValue['created_by'];
    }
    try {
      if (this.matDialogData.isCreate) {
        if (this.list.name === 'incident' && this.picture.length) {
          const uploadResult = await this.uploadImage();
          if (uploadResult) {
            this.form.controls['img_url'].patchValue(uploadResult);
            defaultValue['img_url'] = uploadResult;
            await this.defaultValueService.createDefaultValue(this.list.apiEndpoint, defaultValue);
            this.toastrService.success('The default value is created successfully!', 'Success!');
          }
        } else {
          await this.defaultValueService.createDefaultValue(this.list.apiEndpoint, defaultValue);
          this.toastrService.success('The default value is created successfully!', 'Success!');
        }
      } else {
        if (this.list.name === 'incident') {
          if (this.picture.length) {
            const uploadResult = await this.uploadImage();
            if (uploadResult) {
              this.form.controls['img_url'].patchValue(uploadResult);
              defaultValue['img_url'] = uploadResult;
              await this.defaultValueService.updateDefaultValue(this.list.apiEndpoint, defaultValue);
              this.toastrService.success('The default value is created successfully!', 'Success!');
            }
          } else {
            await this.defaultValueService.updateDefaultValue(this.list.apiEndpoint, defaultValue);
            this.toastrService.success('The default value is created successfully!', 'Success!');
          }
        } else {
          await this.defaultValueService.updateDefaultValue(this.list.apiEndpoint, defaultValue);
          this.toastrService.success('The default value is updated successfully!', 'Success!');
        }
      }
      this.dialogRef.close(true);
    } catch (e) {
      this.toastrService.error( (e.error && e.error.hasOwnProperty('message')) ? e.error.message : 'Something went wrong', 'Error!');
      this.dialogRef.close(false);
    }
  }

  getCurrencySelectClass(field) {
    if (!this.form.value[field]) {
      return '';
    } else {
      return `country-select flag-icon flag-icon-${this.form.value[field].toLowerCase()}`;
    }
  }

  onPictureRemoved(event) {
    this.picture = [];
    this.form.controls['img_url'].setValue(null);
  }

  onImageAdded(event) {
    this.picture = event.currentFiles;
    this.form.controls['img_url'].setValue(event.currentFiles[0].name);
  }

  async uploadImage() {
    return await this.uploadService.uploadOneByPurpose(this.picture, this.options).toPromise();
  }

  isImagePreviewShown(column, type = true): boolean {
    if (type) {
      return !this.picture.length && this.form.controls[column.name].value && !this.form.controls[column.name].value.endsWith('.xml') && !this.matDialogData.isCreate;
    } else {
      return !this.picture.length && this.form.controls[column.name].value && this.form.controls[column.name].value.endsWith('.xml') && !this.matDialogData.isCreate;
    }
  }

  defineUrl(rowValue): string {
    if (rowValue.startsWith('uploads') || rowValue.startsWith('resource')) {
      return `${this.apiEndpoint}/${rowValue}`;
    } else if (rowValue.startsWith('/incident')) {
      return `${this.apiEndpoint}/resource/images${rowValue}`;
    } else {
      return rowValue;
    }
  }
}
