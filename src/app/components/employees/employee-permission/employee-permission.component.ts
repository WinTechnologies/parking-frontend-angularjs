import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { LoaderService } from '../../../services/loader.service';
import { PermissionSharedService } from '../../../services/permission-shared.service';

@Component({
  selector: 'app-employee-permission',
  templateUrl: './employee-permission.component.html',
  styleUrls: ['./employee-permission.component.scss']
})

export class EmployeePermissionComponent implements OnInit {
  @Input() template: any;
  globalFeatures: any[] = [];
  projectFeatures: any[] = [];

  constructor(
    private apiService: ApiService,
    private permissionSharedService: PermissionSharedService,
    private loaderService: LoaderService,
  ) { }

  async ngOnInit() {
    try {
      this.loaderService.enable();
      const features = await this.permissionSharedService.getFeatures();
      this.globalFeatures = features.filter(feature => feature.section !== 'Project');
      this.projectFeatures = features.filter(feature => feature.section === 'Project');
    } finally {
      this.loaderService.disable();
    }
  }
}