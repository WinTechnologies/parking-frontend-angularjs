import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {ViolationService} from '../../../../services/violation.service';
import {LoaderService} from '../../../../services/loader.service';
import {ToastrService} from 'ngx-toastr';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {PhotoEditorComponent} from '../photo-editor/photo-editor.component';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-violation-details-dialog',
  templateUrl: './violation-details-dialog.component.html',
  styleUrls: ['./violation-details-dialog.component.scss']
})
export class ViolationDetailsDialogComponent implements OnInit, OnDestroy {

  projectId: number;
  canUpdate = false;


  ngUnsubscribe: Subject<void> = new Subject<void>();
  isNonpayment: boolean;
  violation;
  isDelete: boolean;
  isCreate: boolean;
  violationsForm: FormGroup;
  current_violation_id: any;
  baseUrl = this.apiEndpoint;

  constructor(
    private activeRoute: ActivatedRoute,
    private violationService: ViolationService,
    private loaderService: LoaderService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ViolationDetailsDialogComponent>
  ) { }

  ngOnInit() {
    this.getData();
    this.violation = {};
    this.violationsForm = this.formBuilder.group({
      name_en: new FormControl({ value: '', disabled: !this.canUpdate }, Validators.required),
      name_ar: new FormControl({ value: '', disabled: !this.canUpdate }, Validators.required),
      code: new FormControl({ value: '', disabled: !this.canUpdate }, Validators.required),
      is_nonpayment: new FormControl({ disabled: !this.canUpdate } ),
    });
  }

  getData() {
    const data = this.data;
    this.canUpdate = data.canUpdate || false;
    this.isDelete = data.delete || false;
    this.isCreate = data.create || false;
    this.current_violation_id = data.id ;
    this.projectId = data.projectId;

    if (!this.isCreate) {
      this.getViolation(data.id);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onOpenAvatarDialog() {
    if (!this.canUpdate) {
      return;
    }
    const dialogRefPhoto = this.dialog.open(PhotoEditorComponent, {
      width: '40%',
      data: {
        icon_url: this.violation ? this.violation.icon_url : '',
        section: 'violations'
      }
    });

    dialogRefPhoto.afterClosed().subscribe(result => {
      if (result) {
        this.violation.icon_url = result.replace(`\\`, `\/`);
      }
    });
  }

  public getViolation(id) {
    if (id) {
      this.violationService.getViolationById(id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
          if (value[0]) {
            this.violation = value[0];
            this.setValueOnForm(value[0]);
          }
        }
      );
    }
  }

  setValueOnForm(value) {
    this.violationsForm.get('name_en').setValue(value.violation_name_en);
    this.violationsForm.get('name_ar').setValue(value.violation_name_ar ? value.violation_name_ar : undefined);
    this.violationsForm.controls.code.disable();
    this.violationsForm.get('code').setValue(value.violation_code);
    this.violationsForm.get('is_nonpayment').patchValue(value.is_nonpayment);
  }

  public onAdd() {
    if (this.violationsForm.valid && this.violation.icon_url !== undefined) {
      const request = {
        violation_name_en: this.violationsForm.value.name_en,
        icon_url: this.violation.icon_url,
        violation_name_ar: this.violationsForm.value.name_ar,
        violation_code: this.violationsForm.value.code,
        project_id: this.projectId,
        is_nonpayment: this.isNonpayment
      };

      this.violationService.addViolation(request)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.toastrService.success('The violation is created successfully!', 'Success!');
          this.dialogRef.close();
        }, err => {
          if (err.error) {
            if (err.error.message.indexOf('duplicate key') >= 0) {
              this.toastrService.error('Violation code is duplicated!', 'Error');
            }
          }
        });
    } else {
      this.toastrService.error('Please fill in the fields');
    }
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public onUpdate() {
    if (this.violationsForm.valid) {
      const formData = this.violationsForm.value;
      const request = {
        violation_name_en: formData.name_en,
        violation_name_ar: formData.name_ar ? formData.name_ar : undefined,
        violation_code: this.violation.violation_code,
        icon_url: this.violation.icon_url ? this.violation.icon_url : undefined,
        project_id: this.projectId,
        is_nonpayment: this.isNonpayment
      };
      this.violationService.updateViolation(request, this.current_violation_id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.toastrService.success('The violation is updated successfully!', 'Success!');
          this.dialogRef.close();
        }, err => {
          if (err.error) {
            if (err.error.message.indexOf('duplicate key') >= 0) {
              this.toastrService.error('Violation code is duplicated!', 'Error');
            }
          }
        });
    } else {
      this.toastrService.error('Please fill in the fields');
    }
  }

  public numbersOnlyValidation(event) {
    const text = event.keyCode ? String.fromCharCode(event.keyCode) : (event.clipboardData).getData('text');
    if (/\D/g.test(text)) {
      event.preventDefault();
    }
  }
  changeCheck(event: any) {
    if (event.type === 'click') {
      this.isNonpayment = !this.isNonpayment;
    }
  }
}
