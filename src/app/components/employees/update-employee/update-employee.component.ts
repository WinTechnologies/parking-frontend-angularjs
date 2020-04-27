import * as moment from 'moment';
import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Employee } from '../models/employee.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { AvatarEditorComponent } from '../../modals/avatar-editor/avatar-editor.component';
import { Location } from '@angular/common';
import { PgEmployeeService } from '../employee.service';
import { ToastrService } from 'ngx-toastr';
import { config } from '../../../../config';
import { MqttService } from 'ngx-mqtt';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface JobPosition {
  id: string;
  code: string;
  name: string;
  type_job_id: number;
  type_job_name: string;
}

@Component({
  selector: 'app-update-employee',
  templateUrl: './update-employee.component.html',
  styleUrls: ['./update-employee.component.scss']
})

export class UpdateEmployeeComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() employees: Employee[];

  @Input() employee;
  departments: any[];
  positions: any[];
  status: any[];
  dialogAvatar: MatDialogRef<AvatarEditorComponent>;
  employeeEditForm: FormGroup;
  phoneNumberValid: boolean;
  user;
  baseUrl: string = this.apiEndpoint + '/' ;
  genders = [
    {value: 0, name: 'Female'},
    {value: 1, name: 'Male'}
  ];

  // Permission Feature
  @Input() canUpdate;
  mqttTopics = config.mqttTopics.defaultValue;

  @Output() employeeUpdated = new EventEmitter<Employee>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private location: Location,
    private employeeService: PgEmployeeService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private mqttService: MqttService,
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    Object.values(this.mqttTopics).forEach(topic => {
      this.mqttService.observe(topic)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((message) => this.handleLiveUpdate(topic, message))
      ;
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
    const editEmployee = this.employee;
    this.employeeEditForm = this.formBuilder.group({
      firstname: [{value: editEmployee.firstname, disabled: !this.canUpdate}, [Validators.required]],
      lastname: [{value: editEmployee.lastname, disabled: !this.canUpdate}, [Validators.required]],
      username: [{value: editEmployee.username, disabled: !this.canUpdate}, [Validators.required]],
      sex: [{value: editEmployee.sex, disabled: !this.canUpdate}, [Validators.required]],
      marital_status: [{value: editEmployee.marital_status, disabled: !this.canUpdate}, [Validators.required]],
      day_of_birth: [{value: editEmployee.day_of_birth, disabled: !this.canUpdate}, [Validators.required]],
      date_start: [{value: editEmployee.date_start, disabled: !this.canUpdate}, [Validators.required]],
      date_end: [{value: editEmployee.date_end, disabled: !this.canUpdate}],
      address: [{value: editEmployee.address, disabled: !this.canUpdate}, [Validators.required]],
      phone_number: [{value: editEmployee.phone_number || '', disabled: !this.canUpdate}, [Validators.required]],
      password: ['', [Validators.minLength(6)]],
      confirm_password: [''],
      employee_id: [{value: editEmployee.employee_id, disabled: true}, [Validators.required]],
      landline: [{value: editEmployee.landline, disabled: !this.canUpdate}],
      department: [{value: editEmployee.department, disabled: !this.canUpdate}, [Validators.required]],
      email: [{value: editEmployee.email, disabled: !this.canUpdate}, [Validators.required, Validators.email]],
      position: [{value: editEmployee.job_position, disabled: !this.canUpdate}, [Validators.required]],
      job_type: [{value: editEmployee.job_type, disabled: !this.canUpdate}, [Validators.required]]
    }, {validator: [ this.checkPasswords]});

    this.employee.img_url = editEmployee.img_url;
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

  public onUpdate() {
    if (this.employeeEditForm.valid && !this.invalidPhoneNumber()) {
      const formValue = this.employeeEditForm.value;
      const newEmployee = new Employee();
      newEmployee.id = this.employee.id;
      newEmployee.employee_id = this.employee.employee_id;
      newEmployee.firstname = formValue.firstname;
      newEmployee.lastname = formValue.lastname;
      newEmployee.username = formValue.username;
      newEmployee.sex = formValue.sex.toString();
      newEmployee.marital_status = formValue.marital_status;
      newEmployee.day_of_birth = formValue.day_of_birth;
      newEmployee.date_start = formValue.date_start;
      newEmployee.address = formValue.address;
      newEmployee.phone_number = formValue.phone_number;
      newEmployee.department = formValue.department;
      newEmployee.email = formValue.email;
      newEmployee.job_position = formValue.position;
      newEmployee.job_type = formValue.job_type;
      newEmployee.img_url = this.employee.img_url;

      if (this.employeeEditForm.value.date_end) {
        newEmployee.date_end = this.employeeEditForm.value.date_end;
      }
      if (this.employeeEditForm.value.landline) {
        newEmployee.landline = this.employeeEditForm.value.landline;
      }

      this.employeeService.updateEmployee(newEmployee).subscribe(() => {
        this.employeeUpdated.emit(newEmployee);
        this.toastr.success('The employee is updated successfully!', 'Success!');
      });
    }
  }

  public onCancel() {
    this.employeeUpdated.emit(null);
  }

  getFields() {
    this.employeeService.getValues('department').subscribe( res => {
      this.departments = res.filter(d => d.department_name);
    });

    this.employeeService.getValues('position')
      .subscribe( (positions: JobPosition[]) => {
        this.positions = positions.filter(p => p.name);
      });

    this.employeeService.getStatus().subscribe( res => {
      this.status = res.map(s => s['marital_status']);
      const index = this.status.indexOf(null);
      if (index !== -1) {
        this.status.splice(index, 1);
      }
    });
  }

  setJobType(event) {
    const position: JobPosition = this.positions.find((el: JobPosition) => el.name === event);
    if (position) {
      this.employeeEditForm.controls['job_type'].setValue(position.type_job_name);
    }
  }

  onOpenAvatarDialog() {
    if (!this.canUpdate) {
      return;
    }
    this.dialogAvatar = this.dialog.open(AvatarEditorComponent, {
      width: '40%',
      data: {
        img_url: this.employee.img_url
      }
    });
    this.dialogAvatar.afterClosed().subscribe(result => {
      this.employee.img_url = result ? result : null;
    });
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
    return moment(d).unix() < moment().unix();
  }

  invalidPhoneNumber() {
    return this.employeeEditForm.get('phone_number').hasError('required') || (this.phoneNumberValid !== undefined && !this.phoneNumberValid);
  }

  getPhoneNumber(event) {
    this.employeeEditForm.get('phone_number').setValue(event);
  }

  hasPhoneNumberError(event) {
    this.phoneNumberValid = event;
  }

  telInputObject(telInputObj) {
    telInputObj.setNumber( this.employee.phone_number || '' );
  }
}
