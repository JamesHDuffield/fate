import { Component, Input, AfterViewInit } from '@angular/core';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: [ './splash.component.scss' ],
  animations: [],
})
export class SplashComponent implements AfterViewInit {
  @Input()
  loaded: boolean;
  hide: boolean;
  constructor(private auth: AuthService) {}

  ngAfterViewInit() {
    // tslint:disable-next-line: no-floating-promises
    this.start();
  }

  async start() {
    if (this.loaded) {
      await this.auth.loginAnonymously();
      this.hide = true;
    }
  }
}
