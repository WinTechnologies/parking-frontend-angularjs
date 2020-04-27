import { Component, OnInit, Input, Inject } from '@angular/core';

@Component({
  selector: 'app-assignment-violation-details',
  templateUrl: './assignment-violation-details.component.html',
  styleUrls: ['./assignment-violation-details.component.scss']
})

export class AssignmentViolationDetailsComponent implements OnInit {
  @Input() violation;

  baseUrl = this.apiEndpoint;

  constructor(
    @Inject('API_ENDPOINT') private apiEndpoint: string
  ) { }

  ngOnInit() { }
}