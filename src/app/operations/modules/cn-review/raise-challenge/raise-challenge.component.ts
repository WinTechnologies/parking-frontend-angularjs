import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-raise-challenge',
  templateUrl: './raise-challenge.component.html',
  styleUrls: ['./raise-challenge.component.scss']
})
export class RaiseChallengeComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RaiseChallengeComponent>,
    private readonly formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      reason: ['', [Validators.required]],
    });
  }

  public onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.reason);
    }
  }

  public onCancel() {
    this.dialogRef.close();
  }
}
