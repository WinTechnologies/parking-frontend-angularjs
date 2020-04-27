import * as moment from 'moment';
import MapOptions from '../../../shared/classes/MapOptions';
import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { ActivityNewComponent } from './activity/activity-new/activity-new.component';
import { UploadService } from '../../../services/upload.service';
import { PgKeydatesService } from './keydates/keydates.service';
import { PgClientsService } from './clients/clients.service';
import { ToastrService } from 'ngx-toastr';
import { PgProjectActivityService } from '../services/project-activity.service';
import { PgProjectsService } from '../services/projects.service';
import { ProjectListService } from '../services/project-list.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { PgVatService } from '../services/vat.service';
import { PgListCityService } from '../../assets/services/list-city.service';
import { Ng2FileInputService } from 'ng2-file-input';
import { forkJoin, Subject } from 'rxjs';
import { globalProjectActivities, Project, ProjectActivityItem, ProjectActivityType, ProjectSection} from '../models/project.model';
import { ProjectActivity } from '../models/project-activity.model';
import { ListCity } from '../../assets/models/list-city.model';
import { gTimezoneJson } from '../../mapview/timezone';
import { Keydate } from './keydates/keydates.model';
import { Client } from './clients/client.model';
import { Vat } from '../models/vat';
import { Currencies } from '../../../../config/currencies';
import { config } from '../../../../config';
import { MqttService } from 'ngx-mqtt';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-project-new',
  templateUrl: './project-new.component.html',
  styleUrls: ['./project-new.component.scss']
})

export class ProjectNewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() project = new Project();
  destroy$ = new Subject();
  baseURL = `${this.apiEndpoint}/`;

  mapOptions: any;
  mapdata = '';
  mapCenter: any;

  form: FormGroup;
  establishment_types: string[] = ['Airport', 'Hospital', 'Municipality'];

  activities: ProjectActivityItem[] = globalProjectActivities.slice(6);
  selectedActivity: ProjectActivityItem;

  docFilesUploadIdentifier = 'documents';
  logoUploaderIdentifier = 'logo';
  docFiles: File[] = [];
  logoFile: File;
  originalLogoURL: string;
  base64Logo: string;
  availableCurrencies = Currencies;

  keydates: Keydate[] = [];
  keydates_org: Keydate[] = [];
  clients: Client[] = [];
  clients_org: Client[] = [];
  documents: string[];

  projectActivity: ProjectActivity;

  // Permission Feature
  currentUser: any;
  canUpdate = false;
  list_city = [];
  list_vat = [];
  fileType = 'pdf';
  mqttTopics = config.mqttTopics.defaultValue;

  public options: any;
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly projectService: PgProjectsService,
    private readonly keydateService: PgKeydatesService,
    private readonly clientService: PgClientsService,
    private readonly projectActivityService: PgProjectActivityService,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private readonly dialog: MatDialog,
    private readonly uploadService: UploadService,
    private readonly projectListService: ProjectListService,
    private readonly location: Location,
    private readonly vatService: PgVatService,
    private readonly listCityService: PgListCityService,
    private readonly ng2FileInputService: Ng2FileInputService,
    private mqttService: MqttService,
    @Inject('API_ENDPOINT') private apiEndpoint: string,
    private currentUserService: CurrentUserService,
  ) { }

  async ngOnInit() {
    Object.values(this.mqttTopics).forEach(topic => {
      this.mqttService.observe(topic)
        .pipe(takeUntil(this.destroy$))
        .subscribe((message) => this.handleLiveUpdate(topic, message))
      ;
    });

    this.options = {
      app: 'web',
      section: 'projects',
      sub: 'general'
    };

    try {
      this.currentUser = await this.currentUserService.get();
      this.canUpdate = !this.project.id || CurrentUserService.canUpdate(this.currentUser, 'project_info');

      this.mapOptions = new MapOptions(
        true,
        false,
        false,
        this.canUpdate ? { icon: Project.getProjectCenterIcon() } : this.canUpdate,
        this.canUpdate,
        { lat: 48.864716, lng: 2.349014 }
      );
    } finally {
      this.init();
    }
  }

  ngOnChanges(changes: SimpleChanges): void { }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
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
      case 'city':
        index = this.list_city.findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.list_city.splice(index, 1);
        }
        break;
      case 'vat':
        index = this.list_vat.findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.list_vat.splice(index, 1);
        }
        break;
    }
  }

  private handleDefaultValueCreate(message) {
    switch (message.apiEndpoint) {
      case 'city':
        if (message.id) {
          this.list_city.unshift(message);
        }
        break;
      case 'vat':
        if (message.id) {
          this.list_vat.unshift(message);
        }
        break;
    }
  }

  private handleDefaultValueUpdate(message) {
    let index = 0;
    switch (message.apiEndpoint) {
      case 'city':
        index = this.list_city.findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.updateObjectDetails(this.list_city[index], message);
        }
        break;
      case 'vat':
        index = this.list_vat.findIndex(value => +value.id === +message.id);
        if (index > -1) {
          this.updateObjectDetails(this.list_vat[index], message);
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

  public inputCheck(event: any) {
    const pattern = /[a-zA-Z0-9\/\ ]/;
    const inputChar = event.keyCode ? String.fromCharCode(event.keyCode) : (event.clipboardData).getData('text');
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  async init() {
    this.buildForm();

    this.mapCenter = [
      this.project.id ? this.project.center_latitude : 48.864716,
      this.project.id ? this.project.center_longitude : 2.349014
    ];

    if (this.project.id) {
      const projectMapData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              options: { icon: { options: {
                    iconUrl: '/assets/marker-icon.svg',
                    iconRetinaUrl: '/assets/marker-icon.svg',
                    iconSize: [48, 48],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    tooltipAnchor: [16, -28],
                    shadowSize: [48, 48]
                  }, _initHooksCalled: true } },
              markerIconsPath: '/assets/',
            },
            geometry: {
              type: 'Point',
              coordinates: [
                this.project.center_latitude,
                this.project.center_longitude
              ]
            }
          }
        ]
      };

      this.mapdata = JSON.stringify(projectMapData);

      const observable1 = [];
      observable1.push(this.keydateService.get({project_id: this.project.id}));
      observable1.push(this.clientService.get({project_id: this.project.id}));
      observable1.push(this.projectActivityService.get({project_id: this.project.id}));

      forkJoin(observable1)
      .takeUntil(this.destroy$)
      .subscribe(res => {
        this.keydates = res[0] as Keydate [];
        this.keydates_org = this.keydates.slice(0);
        this.clients = res[1] as Client [];
        this.clients_org = this.clients.slice(0);
        const activities = res[2] as ProjectActivity [];
        this.activities = [];
        if (activities.length) {
          this.projectActivity = activities[0];
          this.activities = globalProjectActivities.filter(v => {
            if (v.type === ProjectActivityType.CarPark) {
              return this.projectActivity.has_car_park;
            }
            if (v.type === ProjectActivityType.Enforcement) {
              return this.projectActivity.has_enforcement;
            }
            if (v.type === ProjectActivityType.Street) {
              return this.projectActivity.has_on_street;
            }
            if (v.type === ProjectActivityType.RentalCar) {
              return this.projectActivity.has_rental_car;
            }
            if (v.type === ProjectActivityType.TaxiManagement) {
              return this.projectActivity.has_taxi_management;
            }
            if (v.type === ProjectActivityType.ValetParking) {
              return this.projectActivity.has_valet_parking;
            }
          });
        }
      });
    } else {
      // To retrieve the location of the user
      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          position => {
            this.mapCenter = [
              position.coords.latitude,
              position.coords.longitude
            ];
          }
        );
      }

      this.projectService.getNewProjectCode()
        .takeUntil(this.destroy$)
        .subscribe(newCode => {
          this.form.controls['project_code'].setValue(newCode);
        });
    }

    // get list of vats and list of city
    const observable = [];
    observable.push(this.vatService.get());
    observable.push(this.listCityService.get());

    forkJoin(observable)
    .takeUntil(this.destroy$)
    .subscribe(res => {
      this.list_vat = res[0] as Vat[];
      this.list_city = res[1] as ListCity[];
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      project_name: [{value: this.project.id ? this.project.project_name : '', disabled: !this.canUpdate}, [Validators.required]],
      project_code: [{value: this.project.id ? this.project.project_code : '', disabled: this.project.id}, [Validators.required]],
      city_name: [{value: this.project.id ? this.project.city_name : '',  disabled: !this.canUpdate}, [Validators.required]],
      type_establishment: [{value: this.project.id ? this.project.type_establishment : '', disabled: !this.canUpdate}, [Validators.required]],
      project_location: [{value: this.project.id ? this.project.project_location : '',  disabled: !this.canUpdate}, [Validators.required]],
      currency_code: [{value: this.project.id ? this.project.currency_code : '',  disabled: !this.canUpdate}, [Validators.required]],
      notes: [{value: this.project.id ? this.project.notes : '',  disabled: !this.canUpdate}, []],
      vat_id: [{value: this.project.id ? this.project.vat_id : null,  disabled: !this.canUpdate}, [Validators.required]],
      start_date: [{value: this.project.id ? this.project.start_date : '',  disabled: !this.canUpdate}, [Validators.required]],
      end_date: [{value: this.project.id ? this.project.end_date : '', disabled: !this.canUpdate}],
      country_name: [{value: this.project.id ? this.project.country_name : '',  disabled:  !this.canUpdate}, [Validators.required]],
      country_code: [{value: this.project.id ? this.project.country_code : '',  disabled:  !this.canUpdate}, [Validators.required]],
      center_latitude: [{value: this.project.id ? this.project.center_latitude : '',  disabled:  !this.canUpdate}, [Validators.required]],
      center_longitude: [{value: this.project.id ? this.project.center_longitude : '',  disabled:  !this.canUpdate}, [Validators.required]],
      gmt: [{value: this.project.id ? this.project.gmt : '', disabled:  !this.canUpdate}, [Validators.required]],
    });

    if (this.project.id) {
      if (this.project.documents) {
        this.documents = this.project.documents.split(',');
      } else {
        this.documents = [];
      }
      this.form.controls['project_code'].setValue(this.project.project_code);
    }
  }

  /**
   *  if the point(p) is inside boundary points(B), return true otherwise false.
   * @param B Boundary points : B[i][1]: latitude, B[i][0]: logitude
   * @param p point
   */
  private isInside(p: any, B: any[]) {
    let crosses = 0;
    for (let i = 0; i < B.length; i++) {
      const j = (i + 1) % B.length;
      if ((B[i][0] > p[1]) !== (B[j][0] > p[1])) {
        const atx = (B[j][1] - B[i][1]) * (p[1] - B[i][0]) / (B[j][0] - B[i][0]) + B[i][1];
        if (p[0] < atx) {
          crosses++;
        }
      }
    }

    return (crosses % 2 ) > 0;
  }

  private getProjectActivities(project: Project): ProjectActivity {
    const projectActivity: ProjectActivity = new ProjectActivity();
    if (this.projectActivity && this.projectActivity.id) {
      projectActivity.id = this.projectActivity.id;
    }
    projectActivity.project_id = project.id;
    projectActivity.created_at = new Date();
    this.activities.forEach(activity => {
      switch (activity.type) {
        case ProjectActivityType.Street:
          projectActivity.has_on_street = true;
        break;
        case ProjectActivityType.CarPark:
          projectActivity.has_car_park = true;
        break;
        case ProjectActivityType.Enforcement:
          projectActivity.has_enforcement = true;
        break;
        case ProjectActivityType.TaxiManagement:
          projectActivity.has_taxi_management = true;
        break;
        case ProjectActivityType.ValetParking:
          projectActivity.has_valet_parking = true;
        break;
        case ProjectActivityType.RentalCar:
          projectActivity.has_rental_car = true;
        break;
      }
    });

    return projectActivity;
  }

  private updateProjectListStorage(project: Project) {
    let storageData = this.projectListService.getStorage();

    const activeProjects = storageData ? storageData.activeProjects : [];
    activeProjects.push(project.id);
    storageData = {
      activeProjects: activeProjects,
      selectedProjectId: project.id,
      selectedIndexInsideProject: ProjectSection.insideProjectInfoTabIndex // Index of the project info
    };

    this.projectListService.setStorage(storageData);
    this.projectListService.setActiveProject(project);
  }
  private checkUpdatedPrjForm(project) {
    try {
        const {
            id, project_name, project_code, city_name, type_establishment,
            project_location, currency_code, notes, vat_id,
            start_date, end_date, country_code, country_name,
            center_latitude, center_longitude, gmt, documents
        } = this.project;

        let selectedProject = new Project();
        selectedProject.id = id;
        selectedProject.project_name = project_name;
        selectedProject.project_code = project_code;
        selectedProject.city_name = city_name;
        selectedProject.type_establishment = type_establishment;
        selectedProject.project_location = project_location;
        selectedProject.currency_code = currency_code;
        selectedProject.notes = notes;
        selectedProject.vat_id = vat_id;
        selectedProject.start_date = start_date;
        selectedProject.end_date = end_date;
        selectedProject.country_code = country_code;
        selectedProject.country_name = country_name;
        selectedProject.center_latitude = center_latitude;
        selectedProject.center_longitude = center_longitude;
        selectedProject.gmt = gmt;
        selectedProject.documents = (documents === null)?'':documents;

        const isNeedUpdateProject = project.isNotEqual(selectedProject);

        return isNeedUpdateProject;
    } catch (e) {
        this.toastr.clear();
        this.toastr.error('Form updated checking issue', 'Error');
    }
  }

  private updateProject(project: Project) {
    if (this.documents) {
        if (project.documents) {
          project.documents = this.documents.join(',') + ',' + project.documents;
        } else {
          project.documents = this.documents.join(',');
        }
      }

      // check if there is something to update.
      let isNeedUpdateProject = this.checkUpdatedPrjForm(project);
      const observable = [];

      if (isNeedUpdateProject) {
        observable.push(this.projectService.update(project));
      }

      // update keydates
      this.keydates.forEach(k => {
        k.project_id = project.id;
        if (!k.id) {
          observable.push(this.keydateService.create(k));
        } else {
          observable.push(this.keydateService.update(k));
        }
      });

      // remove keydates
      const removeKeydates = [];
      this.keydates_org.forEach(v => {
        const find = this.keydates.find( k => k.id === v.id);
        if (!find) {
          removeKeydates.push(v);
        }
      });
      if (removeKeydates.length) {
        removeKeydates.forEach(v => {
          observable.push(this.keydateService.delete(v));
        });
      }

      const isNeedUpdateKeydates = JSON.stringify(this.keydates) !== JSON.stringify(this.keydates_org);

      // update client
      this.clients.forEach(c => {
        c.project_id = project.id;
        if (!c.id) {
          observable.push(this.clientService.create(c));
        } else {
          observable.push(this.clientService.update(c));
        }
      });

      // remove clients
      const removeClients = [];
      this.clients_org.forEach(v => {
        const find = this.clients.find( k => k.id === v.id);
        if (!find) {
          removeClients.push(v);
        }
      });
      if (removeClients.length) {
        removeClients.forEach(v => {
          observable.push(this.clientService.delete(v));
        });
      }

      const isNeedUpdateClients = JSON.stringify(this.clients) !== JSON.stringify(this.clients_org);

      // update activities
      const projectActivity: ProjectActivity = this.getProjectActivities(project);
      let isNeedUpdateActivity = true;
      if (this.projectActivity && this.projectActivity.id) {
        isNeedUpdateActivity = projectActivity.isNotEqual(this.projectActivity);
        if (isNeedUpdateActivity) {
          observable.push(this.projectActivityService.update(projectActivity));
        }
      } else {
        observable.push(this.projectActivityService.create(projectActivity));
      }
      if (observable.length && (isNeedUpdateProject
        || isNeedUpdateKeydates
        || isNeedUpdateClients
        || isNeedUpdateActivity)) {
        forkJoin(observable)
        .takeUntil(this.destroy$)
        .subscribe(res => {
          if (this.selectedActivity && this.selectedActivity.type === ProjectActivityType.Enforcement) {
            this.router.navigate(['project/setup/enforcement', {projectId: this.project.id}]);
          } else if (this.selectedActivity && this.selectedActivity.type === ProjectActivityType.Street) {
            this.router.navigate(['project/setup/onstreet', { id: this.project.id }]);
          } else if (this.selectedActivity && this.selectedActivity.type === ProjectActivityType.CarPark) {
            this.router.navigate(['project/setup/carpark', { id: this.project.id }]);
          }
          this.toastr.clear();
          this.toastr.success('The project is updated successfully!', 'Success!');
          // reset all variables
          this.project = project;
          this.clients_org = this.clients.slice(0);
          this.keydates_org = this.keydates.slice(0);
          this.projectActivity = projectActivity;
        }, err => {
          if (err.error) {
            this.toastr.clear();
            this.toastr.error(err.error.error, 'Error!');
          }
        });
      } else {
        if (this.selectedActivity && this.selectedActivity.type === ProjectActivityType.Enforcement) {
          this.router.navigate(['project/setup/enforcement', {projectId: this.project.id}]);
        } else if (this.selectedActivity && this.selectedActivity.type === ProjectActivityType.Street) {
          this.router.navigate(['project/setup/onstreet', { id: this.project.id }]);
        } else if (this.selectedActivity && this.selectedActivity.type === ProjectActivityType.CarPark) {
          this.router.navigate(['project/setup/carpark', { id: this.project.id }]);
        }
      }
  }

  private newProject(project: Project, project_code) {
    this.projectService.checkCodeExists({ project_code: project_code })
        .takeUntil(this.destroy$)
        .subscribe(prj_codes => {
            if (prj_codes[0]['exists']) {
                this.toastr.clear();
                this.toastr.error('This code is already used by another project. Please consider using other code.', 'Error');
                return;
            } else {
                this.projectService.create(project)
                    .takeUntil(this.destroy$)
                    .subscribe(res => {
                    if (res['project']) {
                        const newProject = res['project'][0] as Project;
                        const observable = [];
                        this.keydates.forEach(keydate => {
                        keydate.project_id = newProject.id;
                        observable.push(this.keydateService.create(keydate));
                        });

                        this.clients.forEach(client => {
                        client.project_id = newProject.id;
                        observable.push(this.clientService.create(client));
                        });

                        // create activities
                        const projectActivity = this.getProjectActivities(newProject);
                        observable.push(this.projectActivityService.create(projectActivity));

                        if (observable.length) {
                        forkJoin(observable)
                        .takeUntil(this.destroy$)
                        .subscribe(response => {
                            this.toastr.clear();
                            this.toastr.success('New project is created successfully!', 'Success!');
                            // navigate to project info tab for editing this project
                            this.updateProjectListStorage(newProject);
                            this.router.navigate(['project/list']);
                        });
                        } else {
                        this.toastr.clear();
                        this.toastr.success('New project is created successfully!', 'Success!');
                        // navigate to project info tab for editing this project
                        this.updateProjectListStorage(newProject);
                        this.router.navigate(['project/list']);
                        }
                    }
                    }, err => {
                    if (err.error) {
                        if (err.error.message.indexOf('duplicate key') >= 0) {
                        this.toastr.clear();
                        this.toastr.error('This (project) name is already used by another project. Please consider using other name.', 'Error');
                        }
                    }
                    });

                return;
            }
        }, (err) => {
            if (err.message) {
                this.toastr.error(err.message, 'Error!');
            }
        });
  }

  private createProject(project: Project) {
    const project_code = this.form.controls['project_code'].value;

    if (this.project.id) {
        project.id = this.project.id;
        this.updateProject(project);
    } else {
        this.newProject(project, project_code);
    }
  }

  public onProjectMapDataChanged(mapdata: string) {
    const mapdataObj = JSON.parse(mapdata);
    if (
      mapdataObj &&
      mapdataObj.features.length > 0 &&
      mapdataObj.features[0].geometry &&
      mapdataObj.features[0].geometry.coordinates &&
      mapdataObj.features[0].geometry.coordinates.length === 2
    ) {
      const location = mapdataObj.features[0].geometry.coordinates[0] +
      ',' + mapdataObj.features[0].geometry.coordinates[1];
      this.project.center_latitude = mapdataObj.features[0].geometry.coordinates[0];
      this.project.center_longitude = mapdataObj.features[0].geometry.coordinates[1];
      this.form.controls['center_latitude'].setValue(this.project.center_latitude);
      this.form.controls['center_longitude'].setValue(this.project.center_longitude);
      const findFeature = gTimezoneJson.geojsonFeature.features.find(feature => {
        return feature.geometry && feature.geometry.coordinates && this.isInside( mapdataObj.features[0].geometry.coordinates, feature.geometry.coordinates[0]);
      });

      if (findFeature) {
        this.form.controls['gmt'].setValue(findFeature.properties.time_zone);
      }

      this.projectService.getCountryCodeWithName(this.project.center_latitude, this.project.center_longitude)
      .takeUntil(this.destroy$)
      .subscribe(res => {
        if (res) {
          this.project.country_code = null;
          this.project.country_name = null;
          this.form.controls['country_code'].setValue(res.countryCode);
          this.form.controls['country_name'].setValue(res.countryName);
        }
      });
    } else {
      this.project.center_latitude = null;
      this.project.center_longitude = null;
      this.form.controls['center_latitude'].setValue(this.project.center_latitude);
      this.form.controls['center_longitude'].setValue(this.project.center_longitude);
      this.form.controls['gmt'].setValue('');
    }
  }

  public onSelectActivity(activity) {
    if (!this.canUpdate) {
      return;
    }
    this.selectedActivity = activity;
  }

  public checkFormChanges() {
    if (this.form.valueChanges && this.project.id) {
      this.toastr.clear();
      this.toastr.info('Please click on update button to save all your modifications.');
    }
  }

  public onSubmit() {
    if (!this.canUpdate) {
      return;
    }

    if (this.form.valid) {
      const proj = this.form.value;
      const project = new Project();

      project.project_code = this.form.controls['project_code'].value; // project_code is disabled form control
      project.project_name = proj.project_name;
      project.city_name = proj.city_name;
      project.type_establishment = proj.type_establishment;
      project.project_location = proj.project_location;
      project.currency_code = proj.currency_code;
      project.notes = proj.notes;
      project.vat_id = proj.vat_id;
      project.start_date = proj.start_date;
      project.end_date = proj.end_date; // Optional
      project.country_code = this.form.controls['country_code'].value; // disabled form control
      project.country_name = this.form.controls['country_name'].value; // disabled form control
      project.center_latitude = this.form.controls['center_latitude'].value; // disabled form control
      project.center_longitude = this.form.controls['center_longitude'].value; // disabled form control
      project.gmt = this.form.controls['gmt'].value; // disabled form control
      project.created_at = new Date();
      project.documents = '';
      const uploadList = { docFilesUploaded: false, logoUploaded: false };
      const uploadObservables = [];

      if (this.docFiles && this.docFiles.length) {
        uploadList.docFilesUploaded = true;
        uploadObservables.push(this.uploadService.uploadManyByPurpose(this.docFiles, this.options));
      }
      if (this.logoFile) {
        uploadList.logoUploaded = true;
        uploadObservables.push(this.uploadService.uploadOneByPurpose([this.logoFile], this.options));
      }

      forkJoin(uploadObservables)
        .takeUntil(this.destroy$)
        .subscribe(res => {
          if (uploadList.docFilesUploaded) {
            project.documents = res[0].join(',');
            if (uploadList.logoUploaded) {
              project.img_url = res[1];
            }
          } else if (uploadList.logoUploaded) {
            project.img_url = res[0];
          }
        },
        (err) => {
          if (err.message) {
            this.toastr.error(err.message, 'Error!');
          }
        },
        () => this.createProject(project));
    } else {
      this.toastr.clear();
      this.toastr.error('Please fill in the required fields.', 'Error!');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  public onChangeLogo() {
    if (this.project.img_url) {
      this.originalLogoURL = this.project.img_url;
      this.project.img_url = null;
    }
    this.base64Logo = null;
    this.logoFile = null;
  }

  public onCancelChangeLogo() {
    this.project.img_url = this.originalLogoURL;
    this.base64Logo = null;
    this.logoFile = null;
  }

  private createImageFromBlob(imageFile: File) {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.base64Logo = reader.result;
      }
    };
    if (imageFile) {
      reader.readAsDataURL(imageFile);
    }
  }

  public onImageAdded(event: {file, currentFiles}) {
    this.logoFile = event.file;
    if (this.logoFile) {
        const imgFileType = this.logoFile.type.match('image.*') && !(this.logoFile.type === 'image/x-icon');
        if (imgFileType) {
            this.createImageFromBlob(this.logoFile);
        }else {
            this.toastr.error('Invalid Image file for Logo!', 'Error');
            return;
        }
    }
    if (this.project.id) {
      this.toastr.clear();
      this.toastr.info('Please click on update button to save all your modifications.');
    }
  }

  public onImageRemoved(event: any) {
    this.logoFile = event.currentFiles;
    this.base64Logo = null;
  }

  public showDocument(doc) {
    const url = `${this.apiEndpoint}/${doc}`;
    window.open(url, '_blank');
  }

  public onDocumentAdded(event: any) {
    this.docFiles = event.currentFiles;

    for (let i = 0; i < this.docFiles.length; i++) {
      const file = this.docFiles[i];
      const docFileType = file.type === 'text/plain' || file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      if (!docFileType) {
        this.onRemoveDoc(i);
        this.toastr.error('Document file format is invalid.', 'Error');
        return;
      }
    }

    if (this.project.id) {
      this.toastr.clear();
      this.toastr.info('Please click on Upate button to save all your modification(s)');
    }
  }

  public onDocumentRemoved(event: any) {
    this.docFiles = event.currentFiles;
  }

  public onRemoveDoc(index: number) {
    this.docFiles.splice(index, 1);
    if (this.project.id) {
      this.toastr.clear();
      this.toastr.info('Please click on update button to save all your modifications.');
    }
  }

  public onAddActivity() {
    const dialogRef = this.dialog.open(ActivityNewComponent, {
      width: '760px',
      data: this.activities
    });

    dialogRef.afterClosed()
    .takeUntil(this.destroy$)
    .subscribe(result => {
      if (result) {
        this.activities = result;

        if (this.project.id) {
          this.toastr.clear();
          this.toastr.info('Please click on update button to save all your modifications.');
        }
      }
    });
  }

  public onRemoveDocFromUrl(index: number) {
    this.documents.splice(index, 1);
    if (this.project.id) {
      this.toastr.clear();
      this.toastr.info('Please click on update button to save all your modifications.');
    }
  }

  public onBack() {
    const project = new Project();
    project.id = -1; // id for selecting project list table
    this.updateProjectListStorage(project);
    this.router.navigate(['project/list']);
  }

  getCurrencySelectClass() {
    if (!this.form.value.currency_code) {
      return '';
    } else {
      const currencyCountry = this.availableCurrencies.find(country => country.currencyCode === this.form.value.currency_code);
      return `country-select flag-icon flag-icon-${currencyCountry.code.toLowerCase()}`;
    }
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
}
