import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  sites = environment.sites;

  constructor(public authService: AuthService) { }

  ngOnInit() {
  }
}
