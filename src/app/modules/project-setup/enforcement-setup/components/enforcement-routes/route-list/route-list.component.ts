import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProjectRoute } from '../../../../../../components/enforcement/models/project-route.model';
import { PgProjectRouteService } from '../../../../../../components/enforcement/services/project-route.service';
import { Router } from '@angular/router';
import { AlertdialogComponent } from '../../../../../../components/alertdialog/alertdialog.component';
import { MatDialog } from '@angular/material';
import { LoaderService } from '../../../../../../services/loader.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-route-list',
  templateUrl: './route-list.component.html',
  styleUrls: ['./route-list.component.scss']
})
export class RouteListComponent implements OnInit {
  @Input() projectId: number;
  @Output() changedRouteEmitter: EventEmitter<any> = new EventEmitter<any>();

  routes: ProjectRoute[];
  filteredRoutes: ProjectRoute[];

  constructor(
    private readonly routeService: PgProjectRouteService,
    private readonly router: Router,
    private dialog: MatDialog,
    private loaderService: LoaderService,
    private toastrService: ToastrService,
  ) { }

  ngOnInit() {
    this.getRoutes();
  }

  private getRoutes() {
    this.routeService.get({project_id: this.projectId}).subscribe(res => {
      this.routes = res;
      this.routes.forEach(v => {
        const connecting_points = JSON.parse(v.connecting_points);
        v['waypoints'] = connecting_points.waypoints;
      });
      this.filteredRoutes = this.routes;
    });
  }

  public onViewRoute(route: ProjectRoute) {
    this.changedRouteEmitter.emit(route);
  }

  public applyFilterRoute(filter: string) {
    filter = filter.trim().toLowerCase();
    this.filteredRoutes = this.routes.filter( route => {
      return (route.route_name.toLocaleLowerCase().indexOf(filter) >= 0);
    });
  }

  onDeleteRoute(event, route: ProjectRoute) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {
        title: 'Confirm',
        message: 'This action is not reversible! Are you sure you want to delete?',
        btnOk: 'Ok',
        btnCancel: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loaderService.enable();
        this.routeService.delete(route.id)
          .subscribe(response => {
            this.toastrService.success('The route is deleted successfully!', 'Success!');
            this.getRoutes();
            this.loaderService.disable();
          })
        ;
      }
    });
  }

  // Author: Han
  // Created at: 2019/12/20
  // Edit Enforcement Route
  onEditRoute(event, route: ProjectRoute) {
    event.stopPropagation();

  }
}
