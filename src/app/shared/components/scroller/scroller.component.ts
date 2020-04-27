import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-scroller',
  templateUrl: './scroller.component.html',
  styleUrls: ['./scroller.component.scss']
})
export class ScrollerComponent implements OnInit {
  @ViewChild('wrapper') wrapper;

  private dx = 0.1;

  constructor() {
  }

  ngOnInit() {
  }

  public moveLeft() {
    const el = this.wrapper.nativeElement;
    let left = el.scrollLeft - this.dx * el.scrollWidth;

    if (left < 0) {
      left = 0;
    }

    el.scrollLeft = left;
  }

  public moveRight() {
    const el = this.wrapper.nativeElement;
    let left = el.scrollLeft + this.dx * el.scrollWidth;

    if (left > el.scrollWidth) {
      left = el.scrollWidth;
    }

    el.scrollLeft = left;
  }
}
