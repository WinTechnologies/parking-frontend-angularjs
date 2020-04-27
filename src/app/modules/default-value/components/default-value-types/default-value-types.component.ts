import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CurrentUserService } from '../../../../services/current-user.service';
import { LoaderService } from '../../../../services/loader.service';
import { defaultValueTypes } from '../../default-value.fixtures';

@Component({
  selector: 'app-default-value-types',
  templateUrl: './default-value-types.component.html',
  styleUrls: ['./default-value-types.component.scss']
})
export class DefaultValueTypesComponent implements OnInit {

  today = new Date();

  defaultValueTypes = defaultValueTypes;

  // Permission Feature
  permission = {
    isCreate: false,
    isUpdate: false,
    isDelete: false,
  };


  constructor(
    private location: Location,
    private currentUserService: CurrentUserService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
  }

  onBack() {
    this.location.back();
  }

}
