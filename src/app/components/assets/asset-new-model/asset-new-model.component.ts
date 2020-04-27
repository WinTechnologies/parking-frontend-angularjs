import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asset, AssetModel } from '../models/asset.model';
import { Location } from '@angular/common';
import { PgAssetService } from '../services/assets.service';
import { ToastrService } from 'ngx-toastr';
import { Project } from '../../projects/models/project.model';
import { PgProjectsService } from '../../projects/services/projects.service';
import { PgAssetModelsService } from '../services/assets-models.service';
import { PgListCityService } from '../services/list-city.service';
import { ListCity } from '../models/list-city.model';
import { Subject, forkJoin, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { config } from '../../../../config';
import { MqttService} from 'ngx-mqtt';

@Component({
  selector: 'app-asset-new-model',
  templateUrl: './asset-new-model.component.html',
  styleUrls: ['./asset-new-model.component.scss']
})

export class AssetNewModelComponent implements OnInit, OnDestroy {
  @Input() params: any;
  @Output() goBackEvent = new EventEmitter<boolean>();

  ngUnsubscribe: Subject<void> = new Subject<void>();
  assetType: string;
  modelType: string;
  form: FormGroup;
  asset: Asset = new Asset ();
  project: Project;
  assetModel: AssetModel;
  categoryAsset: string;
  public employeeId: string;
  assets: any[];

  listCity: ListCity[];
  listCitySelected: ListCity;

  vehicleCountryNames: string[];
  vehicleBrandNames: string[];

  today = new Date();
  mqttTopics = config.mqttTopics.defaultValue;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private readonly formBuilder: FormBuilder,
    private assetService: PgAssetService,
    private projectService: PgProjectsService,
    private assetModelService: PgAssetModelsService,
    private readonly listCityService: PgListCityService,
    private mqttService: MqttService,
    private readonly toastr: ToastrService
  ) {
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      if (params['employee_id']) {
        this.employeeId = params['employee_id'];
      }
      if (params['type']) {
        this.assetType = params['type'];
      }
      if (params['name']) {
        this.modelType = params['name'];
        this.assetModelService.get({name: this.modelType}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.assetModel = res[0];
          this.buildForm();
        });
      }
      if (params['project_id']) {
        const project_id = params['project_id'];
        this.projectService.getProjectById(project_id)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.project = res;
          });
      }
    });
  }

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
    this.employeeId = this.params['employee_id'];
    this.assetType = this.params['type'];
    this.modelType = this.params['name'];

    const queue = [
      this.assetModelService.get({name: this.modelType}),
      this.assetService.getBrands(),
      this.assetService.getCountries()
    ];

    if (this.params['project_id']) {
      queue.push(this.projectService.getAllUserProjects({id: this.params['project_id']}));
    }
    queue.push(this.listCityService.get());
    forkJoin(queue).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        const [models, brands, countries, projects, cities] = result;
        this.assetModel = models[0];
        const topBrandNames = brands.sort((a, b) => b.clicks - a.clicks).slice(0, 3)
          .map(brand => brand.make_name_en);
        const filteredSortedBrandNames = brands.sort((a, b) => {
            if (a.make_name_en > b.make_name_en) {
              return 1;
            }
            if (a.make_name_en < b.make_name_en) {
              return -1;
            }
            return 0;
          })
          .map(brand => brand.make_name_en);
        this.vehicleBrandNames = [
          ...topBrandNames,
          ...filteredSortedBrandNames
        ];
        this.vehicleCountryNames = countries.map(country => country.issue_authority)
          .reduce((all, country) => {
            if (all.indexOf(country) === -1) {
              all.push(country);
              return all;
            } else {
              return all;
            }
          }, []);
        if (projects && projects.length) {
          this.project = projects[0];
          if (cities && cities.length) {
            this.listCitySelected = cities.find(city => city.city_name === this.project.city_name);
          }
        }
        this.buildForm();
      });

    this.getListCity();
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
    if (message.apiEndpoint === 'city') {
        const index = this.listCity.findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.listCity.splice(index, 1);
        }
    }
  }

  private handleDefaultValueCreate(message) {
    if (message.apiEndpoint === 'city' && message.id) {
      this.listCity.unshift(message);
    }
  }

  private handleDefaultValueUpdate(message) {
    if (message.apiEndpoint === 'city') {
      const index = this.listCity.findIndex(value => +value.id === +message.id);
      if (index > -1) {
        this.updateObjectDetails(this.listCity[index], message);
      }
    }
  }

  updateObjectDetails(source, updated) {
    Object.keys(updated).forEach((field) => {
      if (source.hasOwnProperty(field) && source[field] !== updated[field]) {
        source[field] = updated[field];
      }
    });
  }

  private getListCity() {
    this.listCityService.get().pipe(takeUntil(this.ngUnsubscribe)).subscribe(listCity => {
      this.listCity = listCity;
      if (this.listCitySelected) {
        this.form.controls['city'].setValue(this.listCitySelected);
        this.onChangeCity(this.listCitySelected);
      }
    });
  }

  public onBack() {
    this.goBackEvent.emit(true);
  }

  public onChangeCity(listCity: ListCity) {
    this.listCitySelected = listCity;
    this.assetService.get({type_asset: this.assetType, model_txt: this.modelType}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(asset => {
      this.assets = asset;
      this.generateCodificationId(asset);
    });
  }

  private generateCodificationId(asset: Asset[]) {
    const cityId = this.listCitySelected.city_code;
    const assetTxtLetter = this.assetType !== 'Parking Meter' ?  this.assetType.substr(0, 3).toUpperCase() : '';
    const modelCode = this.assetModel.code;
    const machineIds = asset.map(x => x.codification_id.substr(x.codification_id.length - 3));
    const newMachineId = machineIds.length > 0 ? `00${(+machineIds.reduce((max, p) => p > max ? p : max, machineIds[0]) + 1)}` : '001';
    this.form.controls['codification_id'].setValue(`${cityId}${assetTxtLetter}${modelCode}00${newMachineId.substr(-3)}`);
  }

  public onSubmit() {
    if (!this.form.valid) {
      this.toastr.clear();
      this.toastr.error('Please fill all the required field', 'Error!');
      return;
    }
    const form = this.form.value;
    this.asset.model_code = this.assetModel.code || null;
    this.asset.img_url = this.assetModel.img_url || null;
    this.asset.status = 'Available';
    if (this.assetModel.category_asset === 'Vehicle') {
      this.asset.status_vehicle = 'Available';
    }
    this.asset.created_at = form.date_created || null;
    this.asset.type_asset = this.assetType || null;
    this.asset.manufacturer = form.manufacturer || null;
    this.asset.firmware_version = form.firmware_version || null;
    this.asset.model_id = this.assetModel.id || null;
    this.asset.eol_at = form.date_end_of_life || null;
    this.asset.warranty_until = form.product_warranty || null;
    this.asset.configurations = form.configurations || null;
    if (this.params.project_id) {
      this.asset.project_id = this.project.id;
    }
    this.asset.notes = form.asset_notes;
    this.asset.ip_address = form.serialNumber || null;
    this.asset.vehicle_plate = form.vehicle_plate || null;
    this.asset.vehicle_plate_ar = form.vehicle_plate_ar || null;
    this.asset.vehicle_brand = form.vehicle_brand || null;
    this.asset.vehicle_country = form.vehicle_country || null;
    this.asset.city_txt = this.listCitySelected.city_name;
    this.asset.created_by = this.employeeId || null;
    this.asset.model_id = this.assetModel.id || null;
    this.assetService.get({type_asset: this.assetType, model_txt: this.modelType}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(asset => {
      this.generateCodificationId(asset);
      this.asset.codification_id = this.form.value.codification_id || null;
      this.assetService.add(this.asset).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.toastr.clear();
        this.toastr.success('New asset is created successfully!', 'Success!');
        this.resetForm(this.asset.eol_at, this.asset.notes, this.asset.warranty_until, this.asset.vehicle_brand, this.asset.vehicle_country);
      }, err => {
        this.toastr.clear();
        this.toastr.error(err.error.message, 'Error!');
      });
    });
  }

  private resetForm(date_end_of_life, asset_notes = '', product_warranty, vehicle_brand = '', vehicle_country = '') {
    this.form.reset({
      model_txt : this.modelType,
      city: this.listCitySelected,
      manufacturer : this.assetModel.manufacturer,
      firmware_version : this.assetModel.firmware_version,
      configurations : this.assetModel.configurations,
      date_created : new Date(),
      date_end_of_life: date_end_of_life  ? new Date(date_end_of_life) : '',
      product_warranty : product_warranty ? new Date(product_warranty) : '',
      serialNumber : '',
      vehicle_plate: '',
      vehicle_plate_ar: '',
      vehicle_brand: vehicle_brand,
      vehicle_country: vehicle_country,
      asset_notes: asset_notes
    });
    this.assetService.get({type_asset: this.assetType, model_txt: this.modelType}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(asset => {
      this.generateCodificationId(asset);
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      model_txt : [this.modelType, [Validators.required]],
      city: this.listCitySelected ? [this.listCitySelected, [Validators.required]] : ['', [Validators.required]],
      codification_id: [''],
      manufacturer : [this.assetModel.manufacturer, [Validators.required]],
      firmware_version : [this.assetModel.firmware_version, [Validators.required]],
      configurations : [this.assetModel.configurations, [Validators.required]],
      date_created : [new Date(), [Validators.required]],
      date_end_of_life : [''],
      product_warranty : [this.assetModel.product_warranty ? new Date(this.assetModel.product_warranty) : '', [Validators.required]],
      serialNumber : (this.assetModel.category_asset !== 'Vehicle') ? ['', [Validators.required]] : [''],
      vehicle_plate: this.assetModel.category_asset === 'Vehicle' ? ['', [Validators.required]] : [''],
      vehicle_plate_ar: this.assetModel.category_asset === 'Vehicle' ? ['', [Validators.required]] : [''],
      vehicle_brand: this.assetModel.category_asset === 'Vehicle' ? ['', [Validators.required]] : [''],
      vehicle_country: this.assetModel.category_asset === 'Vehicle' ? ['', [Validators.required]] : [''],
      asset_notes: [''],
    });
  }

  onCancel() {
    this.goBackEvent.emit(true);
  }
}
