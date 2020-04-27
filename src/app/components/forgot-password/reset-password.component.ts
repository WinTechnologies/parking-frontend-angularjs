import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

interface Response {
  success: boolean,
  message: string,
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})

export class ResetPasswordComponent implements OnInit {
  email: string;
  emailResponse: Response = null;
  sendLabel = 'Send email';
  cancelLabel = 'Cancel';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService,
  ) {
  }

  ngOnInit() {
  }

  onSendResetEmail() {
    this.authService.sendResetPasswordEmail(this.email).subscribe(res => {
      this.emailResponse = res;
      this.sendLabel = 'Resend email';
      this.cancelLabel = 'Return to login page';

      if (res.success) {
        this.toastrService.success(res.message);
      } else {
        this.toastrService.error(res.message);
      }
    });
  }

  gotoLogin() {
    this.router.navigate(['login']);
  }
}