import * as moment from 'moment';
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { PgEmployeeService } from '../employee.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Employee } from '../models/employee.model';
import { AvatarEditorComponent } from '../../modals/avatar-editor/avatar-editor.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AddProjectService } from '../add-project/add-project.service';
import { catchError, takeUntil } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { config } from '../../../../config';
import { MqttService } from 'ngx-mqtt';

interface JobPosition {
  id: string;
  code: string;
  name: string;
  type_job_id: number;
  type_job_name: string;
}

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})

export class AddEmployeeComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() employees: Employee[];

  employee = new Employee();
  departments: any[];
  positions: JobPosition[];
  status: any[];
  minDateValue = new Date();

  employeeForm: FormGroup;
  dialogRef: MatDialogRef<AvatarEditorComponent>;
  user;
  phoneNumberValid: boolean;

  initialTelConfig = {initialCountry: 'SA', preferredCountries: ['SA', 'AE', 'BH', 'KW', 'QA, OM']};
  isPhoneNumberInvalid = false;
  isPhoneNumberEmpty = false;

  baseUrl: string = this.apiEndpoint + '/' ;
  mqttTopics = config.mqttTopics.defaultValue;

  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private router: Router,
    private employeeService: PgEmployeeService,
    private addProjectService: AddProjectService,
    private toastr: ToastrService,
    private mqttService: MqttService,
    private dialog: MatDialog,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
  ) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    Object.values(this.mqttTopics).forEach(topic => {
      this.mqttService.observe(topic)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((message) => this.handleLiveUpdate(topic, message));
    });
    this.initForm();
    this.getFields();
  }

  private handleLiveUpdate(topic, message) {
    const jsonMessage = JSON.parse(message.payload.toString());
    switch (topic) {
      case this.mqttTopics.remove:
        this.handleDefaultValueRemove(jsonMessage);
        break;
      case this.mqttTopics.create:
        this.handleDefaultValueCreate(jsonMessage);
        break;
      case this.mqttTopics.update:
        this.handleDefaultValueUpdate(jsonMessage);
        break;
    }
  }

  private handleDefaultValueRemove(message) {
    let index = 0;
    switch (message.apiEndpoint) {
      case 'department':
        index = this.departments.findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.departments.splice(index, 1);
        }
        break;
      case 'position':
        index = this.positions.findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.positions.splice(index, 1);
        }
        break;
    }
  }

  private handleDefaultValueCreate(message) {
    switch (message.apiEndpoint) {
      case 'department':
        if (message.id) {
          this.departments.unshift(message);
        }
        break;
      case 'position':
        if (message.id) {
          this.positions.unshift(message);
        }
        break;
    }
  }

  private handleDefaultValueUpdate(message) {
    let index = 0;
    switch (message.apiEndpoint) {
      case 'department':
        index = this.departments.findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.updateObjectDetails(this.departments[index], message);
        }
        break;
      case 'position':
        index = this.positions.findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.updateObjectDetails(this.positions[index], message);
        }
        break;
    }
  }

  updateObjectDetails(source, updated) {
    Object.keys(updated).forEach((field) => {
      if (source.hasOwnProperty(field) && source[field] !== updated[field]) {
        source[field] = updated[field];
      }
    });
  }

  private initForm() {
      this.employeeForm = this.formBuilder.group({
          firstname: new FormControl('', [Validators.required]),
          lastname: new FormControl('', [Validators.required]),
          username: new FormControl('', [Validators.required]),
          sex: new FormControl(null, [Validators.required]),
          marital_status: new FormControl(null, [Validators.required]),
          day_of_birth: new FormControl('', [Validators.required]),
          date_end: new FormControl(''),
          date_start: new FormControl('', [Validators.required]),
          address: new FormControl('', [Validators.required]),
          phone_number: new FormControl('', [Validators.required]),
          employee_id: new FormControl('', [Validators.required]),
          landline: new FormControl(''),
          department: new FormControl(null, [Validators.required]),
          email: new FormControl('', [Validators.required, Validators.email]),
          position: new FormControl('', [Validators.required]),
          job_type: new FormControl('', [Validators.required]),
      });
  }

  public onBack() {
    this.location.back();
  }

  public onCancel() {
    this.resetForm();
    this.initForm();
  }

  public onSubmit() {
    const check = this.checkPhoneNumber();
    if (this.employeeForm.valid && !check) {
      const formValue = this.employeeForm.value;
      const newEmployee = new Employee();

      newEmployee.firstname = formValue.firstname;
      newEmployee.lastname = formValue.lastname;
      newEmployee.username = formValue.username;
      newEmployee.sex = formValue.sex;
      newEmployee.marital_status = formValue.marital_status;
      newEmployee.day_of_birth = formValue.day_of_birth;
      newEmployee.date_end ? newEmployee.date_end  = formValue.date_end : newEmployee.date_end = null;
      newEmployee.date_start = formValue.date_start;
      newEmployee.address = formValue.address;
      newEmployee.phone_number = formValue.phone_number;
      newEmployee.employee_id = formValue.employee_id;
      newEmployee.landline = formValue.landline;
      newEmployee.department = formValue.department;
      newEmployee.email = formValue.email;
      newEmployee.job_position = formValue.position;
      newEmployee.job_type = formValue.job_type;
      newEmployee.img_url = this.employee.img_url;

      const self = this;
      this.addProjectService.setEmployee(newEmployee);
      this.employeeService.addEmployee(newEmployee)
        .pipe(
          catchError(error => {
            const msg: string = error.error.message;
            self.toastr.error(`${msg}`, 'Error!');
            return throwError(error);
          })
        )
        .subscribe(res => {
          self.router.navigate(['/employees/create/add-project']);
          self.toastr.success('New employee is registered successfully! Assign project for this employee.', 'Success!');
        });
    }else {
      this.toastr.clear();
      this.toastr.error('Please fill in the required fields.', 'Error!');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  getFields() {
    this.employeeService.getStatus().subscribe( res => {
      this.status = res.map(s => s['marital_status']);
      const index = this.status.indexOf(null);
      if (index !== -1) {
        this.status.splice(index, 1);
      }
    });

    this.employeeService.getValues('department').subscribe( res => {
      this.departments = res.filter(d => d.department_name);
    });

    this.employeeService.getValues('position')
      .subscribe( (positions: JobPosition[]) => {
        this.positions = positions.filter(p => p.name);
      });
  }

  setJobType(event) {
    const position: JobPosition = this.positions.find((el: JobPosition) => el.name === event);
    if (position) {
      this.employeeForm.controls['job_type'].setValue(position.type_job_name);
    }
  }

  onOpenAvatarDialog() {
    this.dialogRef = this.dialog.open(AvatarEditorComponent, {
      width: '40%',
      data: {
         img_url: this.employee.img_url,
         section: 'employees'
      }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.employee.img_url = result ? result : null;
    });
  }

  private resetForm() {
    this.employeeForm.reset({
      firstname: '',
      lastname: '',
      username: '',
      sex: '',
      marital_status: '',
      day_of_birth: '',
      date_end: '',
      date_start: '',
      address: '',
      phone_number: '',
      employee_id: '',
      landline: '',
      department: '',
      email: '',
      position: '',
      img_url: ''
    });


    let control: AbstractControl = null;
    this.employeeForm.markAsUntouched();
    Object.keys(this.employeeForm.controls).forEach((name) => {
      control = this.employeeForm.controls[name];
      control.setErrors(null);
    });
  }

  private checkEmailFormat(fieldControl: AbstractControl): ValidationErrors | null {
    if (!fieldControl.value) {
      return null;
    }
    const re = /^[a-zA-Z0-9.!#$%&�*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/;
    return !new RegExp(re).test(fieldControl.value)
      ? { email: true }
      : null;
  }

  startDateFilter(d) {
    if (!this.employee || !this.employee.date_end) {
      return true;
    } else {
      const date_end = '' + this.employee.date_end;
      if (date_end.length > 10) {
        return moment(d).unix() <= moment(this.employee.date_end).unix();
      } else {
        return true;
      }
    }
  }

  endDateFilter(d) {
    if (!this.employee || !this.employee.date_start) {
      return true;
    } else {
      const date_start = '' + this.employee.date_start;
      if (date_start.length > 10) {
        return moment(d).unix() >= moment(this.employee.date_start).unix();
      } else {
        return true;
      }
    }
  }

  birthtDateFilter(d) {
    return moment(d).unix() < moment().unix() && moment(d).unix() > moment('01.01.1900', 'DD.MM.YYYY').unix();
  }

  invalidPhoneNumber() {
    return this.phoneNumberValid !== undefined && !this.phoneNumberValid;
  }

  emptyPhoneNumber() {
    return this.employeeForm.get('phone_number').hasError('required');
  }

  checkPhoneNumber() {
    this.isPhoneNumberEmpty = this.emptyPhoneNumber();
    this.isPhoneNumberInvalid = this.invalidPhoneNumber();
    return (this.isPhoneNumberInvalid || this.isPhoneNumberEmpty);
  }

  getPhoneNumber(event) {
    this.employeeForm.get('phone_number').setValue(event);
    this.isPhoneNumberEmpty = this.emptyPhoneNumber();
    this.isPhoneNumberInvalid = this.invalidPhoneNumber();
  }

  hasPhoneNumberError(event) {
    this.isPhoneNumberEmpty = this.emptyPhoneNumber();
    this.isPhoneNumberInvalid = this.invalidPhoneNumber();
    this.phoneNumberValid = event;
  }

  numbersOnlyValidation(event) {
    if (/\D/g.test(String.fromCharCode(event.keyCode))) {
      event.preventDefault();
    }
  }
}