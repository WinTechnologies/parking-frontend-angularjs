import * as moment from 'moment';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Keydate } from '../keydates.model';
import { PgKeydatesService } from '../keydates.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-keydate-new',
  templateUrl: './keydate-new.component.html',
  styleUrls: ['./keydate-new.component.scss']
})

export class KeydateNewComponent {
  repeats: string[] = ['Never','Daily','Weekly','Monthly','Yearly'];
  form : FormGroup;
  keydate: Keydate;
  marked = false;

  constructor(
    public dialogRef: MatDialogRef<KeydateNewComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly keyDateService: PgKeydatesService,
    private readonly toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) {
    if (data && data.keydate) {
      this.keydate = data.keydate;
    }
    this.buildForm();
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public onSubmit() {
    if (this.form.valid) {
      let keydate = this.form.value as Keydate;
      if (this.keydate && this.keydate.id) {
        keydate.id = this.keydate.id;
      }

      if (!keydate.end_date) {
        delete keydate.end_date;
      }

      // check by new task name
      let task_name = this.form.controls['task_name'].value;
      let params = {task_name: task_name};

      this.keyDateService.check(params)
        .subscribe(key_date => {
            if(key_date[0]['exists'])
            {
                this.toastr.clear();
                this.toastr.error('This task name is already used. Please consider another task name.', 'Error');
                return;
            } else {
                this.dialogRef.close(keydate);
            }
        }, (err) => {
          if (err.message) {
            this.toastr.error(err.message, 'Error!');
          }
        });
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      task_name: [this.keydate ? this.keydate.task_name : '', [Validators.required]],
      allday: [this.keydate ? this.keydate.allday : false],
      start_date: [this.keydate ? this.keydate.start_date : '', [Validators.required]],
      end_date: [this.keydate ? this.keydate.end_date : ''],
      repeat: [this.keydate ? this.keydate.repeat : '', [Validators.required]],
      remarks: [this.keydate ? this.keydate.remarks : '', [Validators.required]]
    });
  }

  public startDateFilter(date: any) {
    if (!this.form.get('end_date').value) {
      return true;
    } else {
      const end_date = this.form.get('end_date').value as Date;
      return end_date ? (moment(date).unix() < moment(end_date).unix()) : true;
    }
  }

  public endDateFilter(date: any) {
    if (!this.form.get('start_date').value) {
      return true;
    } else {
      const begin_date = this.form.get('start_date').value as Date;
      return begin_date ? (moment(date).unix() > moment(begin_date).unix()) : true;
    }
  }

  toggleVisibility(e){
    this.marked= !this.marked;
  }
}