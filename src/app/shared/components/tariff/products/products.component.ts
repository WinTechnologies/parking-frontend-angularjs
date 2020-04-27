import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../../services/product.service';
import { ProjectService } from '../../../../services/project.service';
import { SiteService } from '../../../../services/site.service';
import { UserTypeService } from '../../../../services/userType.service';
import { AuthService } from '../../../../core/services/auth.service';
import * as moment from 'moment';
import { MatTabGroup, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Product } from '../../../classes/product';
import { CountriesService } from '../../../../services/countries.service';
import { Employee } from '../../../../components/employees/models/employee.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})

export class ProductsComponent implements OnInit {
  overviewSite;
  overviewClientType;
  overviewTable = [];
  overviewProduct = {};
  currency = '';
  product;
  productForm: FormGroup;
  userType;
  clientTypes;
  priceTypes = ['Absolute', 'Fixed rate', 'Ladder', 'Custom'];
  timeUnits = ['5 min', '10 min', '15 min', '30 min', '1h', '2h', '3h'];
  time_type = 'day';
  projects;
  sites;
  percent = {
    min: 0,
    max: 100,
    step: 1,
    value: 30
  };
  weekDays = [
    {name: 'Sunday', checked: false},
    {name: 'Monday', checked: false},
    {name: 'Tuesday', checked: false},
    {name: 'Wednesday', checked: false},
    {name: 'Thursday', checked: false},
    {name: 'Friday', checked: false},
    {name: 'Saturday', checked: false}
  ];
  statusList = [
    {status: 'not active', roles: ['Superadmin']},
    {status: 'validated', roles: ['Admin']},
    {status: 'active', roles: ['Superadmin']}
  ];
  date = new FormControl(new Date());
  products: Product[];
  dataSource: MatTableDataSource<Product>;
  selectedProduct: Product;
  range = [];
  timePoints = [];
  time_for_the_day;
  global_time_spent;
  refresh = false;
  saving = false;
  formErrors = {
    timeUnit: false,
    completedSegments: false,
    completedSegmentsTime: false,
    daysSelect: false,
    paymentSelect: false,
    form_send: false
  };
  notAvailableSegments;
  notAvailableSegmentsError;
  showSegments = true;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['name', 'site_id', 'client_type', 'price_type', 'percent', 'begin_date', 'end_date', 'payment', 'actions'];
  originalSegments: any = [];

  static sortProducts(data) {
    if (data.products.length === 0) {
      data.products.push({'first_interval': '00:00', 'last_interval': '24:00'});
    } else if (data.products.length === 1) {
      const product = data.products[0];
      if (product.first_interval !== '00:00') {
        data.products.unshift({'first_interval': '00:00', 'last_interval': product.first_interval});
      }
      if (product.last_interval !== '24:00') {
        data.products.push({'first_interval': product.last_interval, 'last_interval': '24:00'});
      }
    } else {
      data.products.sort(function (a, b) {
        return a.first_interval > b.first_interval;
      });
      if (data.products[0].first_interval !== '00:00') {
        data.products.unshift({'first_interval': '00:00', 'last_interval': data.products[0].first_interval});
      }
      if (data.products[data.products.length - 1].last_interval !== '24:00') {
        data.products.push({'first_interval': data.products[data.products.length - 1].last_interval, 'last_interval': '24:00'});
      }
      for (let i = 1; i < data.products.length; i++) {
        if (data.products[i].first_interval !== data.products[i - 1].last_interval) {
          data.products.splice(i, 0, {'first_interval': data.products[i - 1].last_interval, 'last_interval': data.products[i].first_interval});
          i++;
        }
      }
    }
    return data;
  }

  constructor(private productService: ProductService, private projectService: ProjectService, private siteService: SiteService, private userTypeService: UserTypeService, private authService: AuthService, private countriesService: CountriesService) {
    this.authService.getProfile().subscribe((profile:Employee) => {
      this.userType = profile.job_position;
    });
    this.projectService.getProjectById(this.projectService.activeProject).subscribe(project => {
      this.countriesService.searchCurrency(project[0]['currency_name']).subscribe(data => {
        this.currency = data[0]['symbol'] || '€';
      });
    });
  }

  ngOnInit() {
    this.notAvailableSegments = [];
    const that = this;
    that.getProjects(function () {
      that.getSites(function () {
        that.getUserTypes(function () {
          that.getProducts();
          that.getOverview(that.overviewSite, that.overviewClientType);
          that.initProductForm(false);
        });
      });
    });
  }

  getOverview(site_id, client_type): void {
    this.overviewTable = [];
    const today = new Date();
    const start_of_week = today.getDate() - today.getDay();
    const start_date = new Date().setDate(start_of_week);
    const end_date = new Date().setDate(start_of_week + 7 * 13);
    this.productService.getOverview(site_id, client_type, moment(start_date).format('YYYY-MM-DD'), moment(end_date).format('YYYY-MM-DD')).subscribe(data => {
      let week = {start: '', end: '', days: []};
      for (let i = 1; i <= Object.keys(data).length; i++) {
        week.days.push(ProductsComponent.sortProducts(data[i - 1]));
        if (i % 7 === 1) {
          week.start = data[i - 1].date;
        }
        if (i % 7 === 0) {
          week.end = data[i - 1].date;
          this.overviewTable.push(week);
          week = {start: '', end: '', days: []};
        }
      }
    });
  }

  openPeriod(product) {
    this.overviewProduct = product;
  }

  getProjects(callback) {
    this.projectService.getProjects().subscribe(projects => {
      this.projectService.activeProject = projects[0].id;
      this.projects = projects;
      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  getSites(callback) {
    this.siteService.getSites(this.projectService.activeProject).subscribe(sites => {
      this.sites = sites;
      this.overviewSite = sites[0]['id'];
      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  getUserTypes(callback) {
    this.userTypeService.getClientTypes().subscribe(clientTypes => {
      this.clientTypes = clientTypes;
      this.overviewClientType = clientTypes[0]['id'];
      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  getProducts() {
    this.productService.getProducts(this.projectService.activeProject).subscribe(products => {

      products.forEach(product => {
        const payment = [];
        let site_name = '', client_type_name = '', fees = '';

        this.sites.forEach(site => {
          if (site.id === product.site_id) {
            site_name = site.name;
          }
        });

        this.clientTypes.forEach(type => {
          if (type.id === product.client_type) {
            client_type_name = type.name;
          }
        });

        if (product.payment_methods && product.payment_methods.length) {
          for (let i = 0; i < product.payment_methods.length; i++) {
            switch (product.payment_methods[i].name) {
              case 'payment_coins': if (product.payment_methods[i].checked) { payment.push('Coins'); } break;
              case 'payment_bank_note': if (product.payment_methods[i].checked) { payment.push('Bank note'); } break;
              case 'payment_e_wallet': if (product.payment_methods[i].checked) { payment.push('E-wallet'); } break;
            }
          }
          fees = this.getPercent(product.payment_methods);
        }

        product.begin_date = moment(product.begin_date).unix();
        product.end_date = moment(product.end_date).unix();

        Object.assign(product, {payment, site_name, client_type_name, fees});
      });

      this.products = products;

      window.setTimeout(() => {
        this.fetchMatTable(this.products);
      });

    });
  }

  initProductForm(refresh, changeTab = false, site = '', client = '', day = '', segments = {}) {
    this.refresh = refresh;
    if (changeTab) {
      this.tabGroup.selectedIndex = 1;
    }

    this.formErrors = {
      timeUnit: false,
      completedSegments: false,
      completedSegmentsTime: false,
      daysSelect: false,
      paymentSelect: false,
      form_send: false
    };

    this.product = {
      name: '',
      client_type: client && client.length ? client : null,
      price_type: 'Custom',
      price_per_time_unit: null,
      amount_of_unit: null,
      initial_time_unit_price: null,
      growth_factor: null,
      price: null,
      time_unit: '5 min',
      time_segments: [],
      project_id: this.projectService.activeProject,
      days: [],
      site_id: site && site.length ? site : null,
      begin_date: null,
      end_date: null,
      valet_system: false,
      status: 'not active',
      payment_methods: [
        {
          name: 'payment_coins',
          percent: this.percent.value,
          checked: false
        },
        {
          name: 'payment_bank_note',
          percent: this.percent.value,
          checked: false
        },
        {
          name: 'payment_e_wallet',
          percent: this.percent.value,
          checked: false
        }
      ]
    };
    this.range = [];
    this.timePoints = [];

    if (this.product.site_id) {
      this.getNotAvailableSegments();
    }

    for (let i = 0; i < this.weekDays.length; i++) {
      this.weekDays[i].checked = false;
      this.product.days.push(this.weekDays[i]);
    }
    if (day) {
      this.product.days[new Date(day).getDay()].checked = true;
      this.product.begin_date = moment(day).toISOString();
      this.product.end_date = moment(day).add(1, 'days').toISOString();
    }
    if (segments.hasOwnProperty('start') && segments.hasOwnProperty('end')) {
      const start = parseInt(segments['start'].split(':')[0], 10);
      const end = parseInt(segments['end'].split(':')[0], 10);
      for (let i = start; i < end; i++) {
        this.product.time_segments.push((i < 10 ? '0' + i : i) + ':00');
      }
    }

    window.setTimeout(() => {
      this.productForm = new FormGroup({
        name: new FormControl(this.product.name),
        valet_system: new FormControl(this.product.valet_system),
        client_type: new FormControl(this.product.client_type),
        price_type: new FormControl(this.product.price_type),
        price_per_time_unit: new FormControl(this.product.price_per_time_unit),
        amount_of_unit: new FormControl(this.product.amount_of_unit),
        price: new FormControl(this.product.price),
        initial_time_unit_price: new FormControl(this.product.initial_time_unit_price),
        growth_factor: new FormControl(this.product.growth_factor),
        time_unit: new FormControl(this.timeUnits[0]),
        site_id: new FormControl(this.product.site_id),
        begin_date: new FormControl(moment(this.product.begin_date).toISOString()),
        end_date: new FormControl(moment(this.product.end_date).toISOString()),
        payment_coins: new FormControl(false),
        payment_bank_note: new FormControl(false),
        payment_e_wallet: new FormControl(false),
        payment_coins_percent: new FormControl({value: this.percent.value, disabled: true}),
        payment_bank_note_percent: new FormControl({value: this.percent.value, disabled: true}),
        payment_e_wallet_percent: new FormControl({value: this.percent.value, disabled: true}),
        status: new FormControl(this.statusList[0].status),
      });
      this.refresh = false;
    });
  }

  getNotAvailableSegments() {
    this.productService.getNotAvailableSegments(this.product.site_id).subscribe(segArray => {
      this.originalSegments = [];
      if ( Array.isArray(segArray) && segArray.length) {
        for (let i = 0; i < segArray.length; i++) {
          if (segArray[i].start.length === 10) {
            segArray[i].start = new Date(segArray[i].start * 1000).toTimeString().slice(0, 8);
          }
          if (segArray[i].end.length === 10) {
            segArray[i].end = new Date(segArray[i].end * 1000).toTimeString().slice(0, 8);
          }
          this.originalSegments.push(segArray[i]);
        }
        this.checkNotAvailableSegments();
      }
    });
  }

  checkNotAvailableSegments() {
    const local_notAvailableSegments = [];
    if (this.product.begin_date && this.product.end_date) {
      for (let j = 0; j < this.originalSegments.length; j++) {
        if (this.product.id === this.originalSegments[j].id) {
          continue;
        }
        if (this.product.client_type !== this.originalSegments[j].client_type) {
          continue;
        }
        if (new Date(this.product.end_date).getTime() > new Date(this.originalSegments[j].begin_date).getTime() && new Date(this.product.begin_date).getTime() < new Date(this.originalSegments[j].end_date).getTime()) {
          for (let i = 0; i < this.product.days.length; i++) {
            if (this.originalSegments[j].days.indexOf(this.product.days[i].name) > -1 && this.product.days[i].checked) {
              local_notAvailableSegments.push(this.originalSegments[j]);
              break;
            }
          }
        }
      }
    }
    if (JSON.stringify(this.notAvailableSegments) !== JSON.stringify(local_notAvailableSegments)) {
      this.notAvailableSegments = local_notAvailableSegments;
    }
    this.checkTimeSegments();
  }

  checkTimeSegments() {
    this.notAvailableSegmentsError = [];
    this.formErrors.completedSegmentsTime = true;
    if (this.notAvailableSegments.length) {
      for (let i = 0; i < this.notAvailableSegments.length; i++) {
        const start = this.notAvailableSegments[i].start.slice(0, 5);
        const end = this.notAvailableSegments[i].end.slice(0, 5);
        for (let j = 0; j < this.range.length; j++) {
          if (start < this.range[j].text && this.range[j].text < end) {
            this.formErrors.completedSegmentsTime = false;
            this.notAvailableSegmentsError.push( this.notAvailableSegments[i] );
            break;
          }
        }
      }
    }
  }

  checkTimeUnit() {
    const interval = this.getTimeInterval(this.product.time_unit);
    const checkingArray = [];
    let points = 0;
    let breakpoint = false;
    if (this.timePoints.length === 1) {
      checkingArray.push(60 % interval === 0);
    } else {
      for (let i = 0; i < this.timePoints.length; i++) {
        breakpoint = !(i === 0 || parseInt(this.timePoints[i].split(':')[0], 10) - parseInt(this.timePoints[i - 1].split(':')[0], 10) === 1);
        if (breakpoint) {
          checkingArray.push(points % interval === 0);
          points = 60;
        } else {
          points += 60;
        }
      }
      checkingArray.push(points % interval === 0);
    }
    this.formErrors.timeUnit = checkingArray.indexOf(false) === -1;
  }

  onSubmit() {
    this.checkNotAvailableSegments();
    this.formErrors.form_send = true;
    this.formErrors.paymentSelect = false;
    this.product.payment_methods.forEach(method => {
      if (method.checked) { this.formErrors.paymentSelect = true; }
    });
    this.formErrors.daysSelect = false;
    this.product.days.forEach(day => {
      if (day.checked) { this.formErrors.daysSelect = true; }
    });
    this.formErrors.completedSegments = this.product.price_type === 'Custom' ? this.formErrors.completedSegments : this.timePoints.length > 0;
    if (this.productForm.valid) {
      if (this.formErrors.completedSegments && this.formErrors.completedSegmentsTime && this.formErrors.daysSelect && this.formErrors.paymentSelect && this.formErrors.timeUnit) {
        this.setProductFields();
        if (!this.saving) {
          this.saving = true;
          if (this.product.id) {
            this.productService.updateProduct(this.product)
              .subscribe(projectResult => {
                this.getProducts();
                this.initProductForm(true);
                this.getOverview(this.overviewSite, this.overviewClientType);
                this.saving = false;
              });
          } else {
            this.productService.addProduct(this.product)
              .subscribe(projectResult => {
                this.getProducts();
                this.initProductForm(true);
                this.getOverview(this.overviewSite, this.overviewClientType);
                this.saving = false;
              });
          }
        }
      }
    }
  }

  createNewProduct() {
    if (this.product.id) {
      delete this.product.id;
    }
    this.onSubmit();
  }

  getTimeInterval(interval) {
    if (interval.indexOf(' min') !== -1) {
      return parseInt(interval.replace(' min', ''), 10);
    } else if (interval.indexOf('h') !== -1) {
      return parseInt(interval.replace('h', ''), 10) * 60;
    } else {
      return parseInt(interval, 10);
    }
  }

  setRange(_range) {
    this.timePoints = [];
    this.range = [];
    for (let i = 0; i < _range.length; i++) {
      for (let j = 0; j < 60; j++) {
        const time = moment().startOf('day').add(_range[i].val, 'hours').add(j, 'minutes').unix();
        this.range.push(
          {
            val: time,
            text: moment(time * 1000).format('HH:mm')
          }
        );
      }
      if ((i + 1 < _range.length && _range[i + 1].val - _range[i].val !== 1) || i + 1 === _range.length) {
        const time = moment().startOf('day').add(_range[i].val + 1, 'hours').unix();
        this.range.push(
          {
            val: time,
            text: moment(time * 1000).format('HH:mm')
          }
        );
      }

      this.timePoints.push(_range[i].text);
    }
    if (this.range.length && this.range[this.range.length - 1].text === '00:00') {
      this.range[this.range.length - 1].text = '24:00';
    }
    this.checkTimeSegments();
    this.checkTimeUnit();
  }

  setTimeIntervals(time_intervals) {
    if (this.time_type === 'day') {
      this.time_for_the_day = time_intervals.segments;
    } else {
      this.global_time_spent = time_intervals.segments;
    }
    this.formErrors.completedSegments = time_intervals.completed;
  }

  delete(product: Product): void {
    if (window.confirm('Are sure you want to delete this item ?')) {
      this.productService.deleteProduct(product).subscribe(result => {
        const index = this.products.map(item => item.id).indexOf(product.id);
        if (index > -1) {
          this.products.splice(index, 1);
          this.fetchMatTable(this.products);
          this.getOverview(this.overviewSite, this.overviewClientType);
        }
      });
    }
  }

  edit(id): void {
    this.tabGroup.selectedIndex = 1;
    this.showSegments = false;
    this.productService.getProduct(id)
      .subscribe(data => {
        this.formErrors.form_send = false;
        const days = [];
        for (let i = 0; i < this.weekDays.length; i++) {
          days.push(this.weekDays[i]);
        }

        this.product = data[0];
        if (this.product.interval_time && this.product.interval_time.length) {
          this.time_type = (this.product.interval_time[0].type === 1) ? 'day' : 'spent';
        } else {
          this.time_type = 'day';
        }
        this.getNotAvailableSegments();
        if (this.product.interval_time && this.product.interval_time.length) {
          for (let i = 0; i < this.product.interval_time.length; i++) {
            if (this.product.interval_time[i].end === '00:00:00') {
              this.product.interval_time[i].end = '24:00:00';
            }
          }
        }
        this.product.days = this.product.days.length ? this.product.days : days;
        if (this.product.time_segments) {
          this.product.time_segments = this.product.time_segments.split(',');
        }

        let tmp = false;
        for (let i = 0; i < this.product.payment_methods.length; i++) {
          if (this.product.payment_methods[i].checked) {
            tmp = true;
          }
        }
        this.formErrors.paymentSelect = tmp;

        tmp = false;
        for (let i = 0; i < this.product.days.length; i++) {
          if (this.product.days[i].checked) {
            tmp = true;
          }
        }
        this.formErrors.daysSelect = tmp;

        window.setTimeout(() => {
          if (this.product.days[0].number) {
            this.product.days = this.product.days.sort(this.compare);
          }
        }, 10);

        window.setTimeout(() => {
          this.showSegments = true;
        }, 1000);
      });
  }

  startDateFilter(date) {
    if (!this.product || !this.product.end_date) {
      return true;
    } else {
      const end_date = '' + this.product.end_date;
      return (end_date.length > 10) ? (moment(date).unix() < moment(this.product.end_date).unix()) : true;
    }
  }

  endDateFilter(date) {
    if (!this.product || !this.product.begin_date) {
      return true;
    } else {
      const begin_date = '' + this.product.begin_date;
      return (begin_date.length > 10) ? (moment(date).unix() > moment(this.product.begin_date).unix()) : true;
    }
  }

  fetchMatTable(products: Product[]): void {
    this.dataSource = new MatTableDataSource(products);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.selectedProduct = this.products ? this.products[0] : null;
  }

  getClass(type) {
    switch (type) {
      case 'Absolute': return 'absolute-type';
      case 'Custom': return 'custom-type';
      case 'Ladder': return 'ladder-type';
      case 'Fixed rate': return 'fixed-type';
    }
  }

  getPercent(payment_types) {
    let counter = 0;
    let percent = 0;
    payment_types.forEach(type => {
      if (type.checked) {
        percent = type.percent;
        counter++;
      }
    });
    if (counter > 1) {
      return 'vary';
    } else {
      return percent + '%';
    }
  }

  changeTimeType(type) {
    this.time_type = type;
  }

  checkTimeType(type) {
    if (this.product.interval_time && this.product.interval_time.length) {
      return this.product.interval_time[0].type === type;
    } else {
      return type === 1;
    }
  }

  private compare(a, b) {
    return a.number < b.number ? -1 : a.number > b.number ? 1 : 0;
  }

  private setProductFields() {
    if (this.product.price_type === 'Absolute') {
      this.time_for_the_day = [];
      this.global_time_spent = [];
      this.product.time_unit = '30 min';
      this.product.price_per_time_unit = 0;
      this.product.amount_of_unit = 0;
      this.product.initial_time_unit_price = 0;
      this.product.growth_factor = 0;
    }
    if (this.product.price_type === 'Fixed rate') {
      this.time_for_the_day = [];
      this.global_time_spent = [];
      this.product.initial_time_unit_price = 0;
      this.product.growth_factor = 0;
      this.product.amount_of_unit = 0;
      this.product.price = 0;
    }
    if (this.product.price_type === 'Ladder') {
      this.time_for_the_day = [];
      this.global_time_spent = [];
      this.product.price_per_time_unit = 0;
      this.product.price = 0;
      this.product.amount_of_unit = 0;
    }
    if (this.product.price_type === 'Custom') {
      this.product.price_per_time_unit = 0;
      this.product.amount_of_unit = 0;
      this.product.initial_time_unit_price = 0;
      this.product.growth_factor = 0;
      this.product.price = 0;
    }
    this.product.begin_date = moment(this.product.begin_date).format('YYYY-MM-DD');
    this.product.end_date = moment(this.product.end_date).format('YYYY-MM-DD');
    const intervals = [];
    if (this.product.price_type === 'Custom') {
      const tmp_int = (this.time_type === 'day') ? this.time_for_the_day : this.global_time_spent;

      if (tmp_int) {

        for (let i = 0; i < tmp_int.length; i++) {
          const pushObj = {
            product_id: this.product ? this.product.id : null,
            start: tmp_int[i].start.text,
            end: tmp_int[i].end.text,
            value: parseFloat(tmp_int[i].amount),
            type: (this.time_type === 'day') ? 1 : 0,
            number: i
          };
          if (tmp_int[i].id) {
            pushObj['id'] = tmp_int[i].id;
          }
          intervals.push(pushObj);
        }
        this.product.intervals = intervals;
      } else {
        this.product.intervals = this.product.interval_time;
      }
    } else {
      this.product.intervals = [];
    }
    delete this.product.interval_time;
    this.product.project_id = this.projectService.activeProject;
    this.product.time_segments = this.timePoints.join(',');
    this.product.amount_of_unit = parseFloat(this.product.amount_of_unit);
    this.product.price_per_time_unit = parseFloat(this.product.price_per_time_unit);
    this.product.initial_time_unit_price = parseFloat(this.product.initial_time_unit_price);
    this.product.growth_factor = parseFloat(this.product.growth_factor);
    this.product.price = parseFloat(this.product.price);
  }
}
