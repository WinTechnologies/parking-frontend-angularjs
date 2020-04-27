import * as moment from 'moment';
import * as _ from 'underscore';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AvatarEditorComponent } from '../modals/avatar-editor/avatar-editor.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Employee } from '../employees/models/employee.model';
import { PgEmployeeService } from '../employees/employee.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { config } from '../../../config';
import { MqttService } from 'ngx-mqtt';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  today = Date.now();
  form: FormGroup;
  initialFormValue: any;
  profileChanged = false;
  pictureChanged = false;
  valueChangeSubscription: Subscription;
  tomorrow = new Date();
  img_url = this.apiEndpoint;
  public user: any;
  employee = new Employee();

  // Temp Dummy Matadata
  positions: any[];
  departments: any[];
  filteredDepartments: any[];
  filtredPositions: any[];
  phoneNumberValid: boolean;
  baseUrl = environment.baseAssetsUrl;
  mqttTopics = config.mqttTopics.defaultValue;
  dialogRef: MatDialogRef<AvatarEditorComponent>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly employeeService: PgEmployeeService,
    private readonly toastr: ToastrService,
    private readonly location: Location,
    private mqttService: MqttService,
    private dialog: MatDialog,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    ) { }

  ngOnInit() {
    Object.values(this.mqttTopics).forEach(topic => {
      this.mqttService.observe(topic)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((message) => this.handleLiveUpdate(topic, message))
      ;
    });
    this.authService.getProfile().subscribe((profile: Employee) => {
      this.employee = profile;
      this.tomorrow.setHours(0, 0, 0, 0);
      this.buildForm();
      this.getFields();
    }, error => {
      console.log('ProfileComponent->ngOnInit->getProfile->error', error);
    });
  }

  ngOnDestroy(): void {
    this.valueChangeSubscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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

  private buildForm() {
    this.form = this.formBuilder.group({
      firstname: [{value: this.employee.firstname, disabled: true}, [Validators.required]],
      lastname: [{value: this.employee.lastname, disabled: true}, [Validators.required]],
      email: [{value: this.employee.email, disabled: true}, [Validators.required, Validators.email]],
      username: [{value: this.employee.username, disabled: true}, [Validators.required]],
      employee_id: [{value: this.employee.employee_id, disabled: true}, [Validators.required]],
      department: [{value: this.employee.department, disabled: true}, [Validators.required]],
      job_position: [{value: this.employee.job_position, disabled: true}, [Validators.required]],
      date_start: [{value: new Date(this.employee.date_start), disabled: true}, [Validators.required]],
      date_end: [{
        value: !this.employee.date_end ?
          '' : new Date(this.employee.date_end),
        disabled: true,
      }],
      day_of_birth: [this.employee.day_of_birth, [Validators.required]],
      sex: [this.employee.sex.toString(), [Validators.required]],
      phone_number: [this.employee.phone_number, [Validators.required]],
      password:         ['', [Validators.minLength(6)]],
      confirm_password: [''],
      landline: [this.employee.landline],
      address: [this.employee.address, [Validators.required]]
    }, {validator: [ this.checkPasswords]});

    this.initChangeListener();
  }

  private initChangeListener() {
    const {
      firstname, lastname, username, employee_id, department,
      job_position, date_start, date_end, email, ...initialVal
    } = this.form.getRawValue();
    this.initialFormValue = initialVal;
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
      this.profileChanged = false;
    }

    this.valueChangeSubscription = this.form.valueChanges.subscribe(currentVal => {
      this.profileChanged = !_.isEqual(this.initialFormValue, currentVal);
    });
  }

  private checkPasswords(group: FormGroup) {
    const pass = group.controls.password.value;
    const confirmPass = group.controls.confirm_password.value;
    if (pass !== confirmPass) {
      group.controls.confirm_password.setErrors({ mismatch: true });
    } else {
      group.controls.confirm_password.setErrors(null);
    }
    return null;
  }

  public onSubmit() {
    if (this.form.valid && !this.invalidPhoneNumber()) {
      const employee = new Employee();
      employee.id = this.employee.id;
      employee.employee_id = this.employee.employee_id;
      employee.firstname     = this.form.value.firstname;
      employee.lastname      = this.form.value.lastname;
      employee.username      = this.form.value.username;
      employee.day_of_birth  = this.form.value.day_of_birth;
      employee.sex           = this.form.value.sex;
      employee.phone_number  = this.form.value.phone_number;
      employee.department    = this.form.value.department;
      employee.job_position  = this.form.value.job_position;
      employee.date_start    = this.form.value.date_start;
      employee.email         = this.form.value.email;
      employee.address       = this.form.value.address;

      if (this.form.value.password) {
        employee.password = this.form.value.password;
      }
      if (this.form.value.date_end) {
        employee.date_end = this.form.value.date_end;
      }
      if (this.form.value.landline) {
        employee.landline = this.form.value.landline;
      }
      employee.img_url = this.employee.img_url ? this.employee.img_url : null;

      this.employeeService.updateEmployee(employee).subscribe(res => {
        this.toastr.success('The User profile is updated successfully!', 'Success!');
        this.initChangeListener();
        this.pictureChanged = false;
      });
    }
  }

  public onCancel() {
    this.location.back();
  }

  public onOpenAvatarDialog() {
    this.dialogRef = this.dialog.open(AvatarEditorComponent, {
      width: '40%',
      data: {
         img_url: this.employee.img_url
      }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employee.img_url = result;
        this.pictureChanged = true;
      }
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
    telInputObj.setNumber( this.employee.phone_number );
  }

  startDateFilter(date) {
    if (!this.form.value.date_end) {
      return true;
    } else {
      return moment(date).unix() <= moment(this.form.value.date_end).unix();
    }
  }

  endDateFilter(date) {
    if (!this.form.value.date_start) {
      return true;
    } else {
      return moment(date).unix() >= moment(this.form.value.date_start).unix();
    }
  }

  getFields() {
    this.employeeService.getValues('department').subscribe( res => {
      this.departments = res.filter(d => d.department_name);
    });

    this.employeeService.getValues('position').subscribe( res => {
      this.positions = res.filter(p => p.name);
    });
  }

  applyFilterDepartment(filter: string) {
    filter = filter.trim().toLowerCase();
    this.filteredDepartments = this.departments.filter(
      department => department.department_name.toLocaleLowerCase().indexOf(filter) >= 0
    );
  }

  applyFilterPosition(filter: string) {
    filter = filter.trim().toLowerCase();
    this.filtredPositions = this.positions.filter(
      position => position.name.toLocaleLowerCase().indexOf(filter) >= 0
    );
  }
}