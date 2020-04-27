import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../services/project.service';
import { PgProjectsService } from '../projects/services/projects.service';
import { ProjectListService } from '../projects/services/project-list.service';
import { CoreService } from '../../services/core.service';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  username: string;
  password: string;
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService,
    public projectService: ProjectService,
    private pgProjectService: PgProjectsService,
    private projectListService: ProjectListService,
    private coreService:  CoreService,
    private toastrService: ToastrService,
  ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl(
        '', [
          Validators.required
        ]
      ),
      password: new FormControl(
        '', [
          Validators.required,
          Validators.min(5)
        ]
      )
    });
  }

  onLoginSubmit() {
    const user = {...this.loginForm.value};
    this.authService.authenticateUser(user)
      .pipe(
        catchError(err => {
          console.error(err);
          return of(err);
        })
      )
      .subscribe(data => {
        if (data && data.success) {
          this.coreService.updateSidebarMenu.emit();
          this.authService.onLoginSuccess(data.token, data.user);
        } else {
          this.toastrService.error(data.error.message, 'Error!');
        }
      });
  }

  gotoForgotPassword() {
    this.router.navigate(['reset-password']);
  }
}
