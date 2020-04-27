import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Client } from '../client.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client-new',
  templateUrl: './client-new.component.html',
  styleUrls: ['./client-new.component.scss']
})

export class ClientNewComponent {
  form: FormGroup;
  client: Client;
  phoneNumberValid: boolean;

  constructor(
    public dialogRef: MatDialogRef<ClientNewComponent>,
    private route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.client) {
      this.client = data.client;
    }
    this.buildForm();
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public onSubmit() {
    if (this.form.valid && !this.invalidPhoneNumber()) {
      const client = this.form.value as Client;
      if (this.client && this.client.id) {
        client.id = this.client.id;
      }
      this.dialogRef.close(client);
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      firstname: [this.client ? this.client.firstname : '', [Validators.required]],
      lastname: [this.client ? this.client.lastname : '', [Validators.required]],
      designation: [this.client ? this.client.designation : '', [Validators.required]],
      phone_number: [this.client ? this.client.phone_number : '', [Validators.required]],
      email: [this.client ? this.client.email : '', [Validators.required, Validators.email]],
      address: [this.client ? this.client.address : '', [Validators.required]]
    });
  }

  invalidPhoneNumber() {
    return this.form.get('phone_number').hasError('required') || (this.phoneNumberValid !== undefined && !this.phoneNumberValid);
  }

  getPhoneNumber(event) {
    this.form.get('phone_number').setValue(event);
  }

  hasPhoneNumberError(event) {
    this.phoneNumberValid = event;
  }

  telInputObject(telInputObj) {
    if (this.client) {
      telInputObj.setNumber( this.client.phone_number );
    }
  }
}