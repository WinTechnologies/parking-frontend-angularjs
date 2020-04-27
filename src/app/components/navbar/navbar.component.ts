import { Component, OnDestroy, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { CoreService } from '../../services/core.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Employee } from '../employees/models/employee.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit, OnDestroy {
  profileRouterLink: any[] = null;
  profile: Employee = null;
  untilGetProfile = new Subject<boolean>();

  constructor(
    public flashMessage: FlashMessagesService,
    public authService: AuthService,
    public router: Router,
    private coreService: CoreService,
    protected toastr: ToastrService,
    public projectService: ProjectService) { }

  ngOnInit() {
    this.authService.getProfile()
      .takeUntil(this.untilGetProfile)
      .subscribe((profile) => {
        this.profileRouterLink = ['/employees', profile.employee_id];
        this.profile = profile;
      });
  }

  ngOnDestroy() {
    this.untilGetProfile.next(true);
    this.untilGetProfile.complete();
  }

  onLogoutClick() {
    try {
      if (window.confirm('Are you sure you want to logout ?')) {
        this.authService.clearUserData();
        this.projectService.activeProject = null;
        this.projectService.activeProjectObject = null;
        this.flashMessage.show('Logged out', {cssClass: 'alert-success', timeout: 5000});
        this.router.navigate(['login']);
        return false;
      }
    } catch (err) {
      this.toastr.error('Failed to logout!', 'Error!');
    }
  }

  toggleSidebar() {
    this.coreService.toggleSidebar.emit();
  }
}
