import { Component, Input, AfterViewInit } from '@angular/core';
import { fade } from '../../animations/fade';
import { AuthService } from '../../service/auth';

const FADE_IN = 1000;
const FADE_DELAY = 3000;

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: [ './splash.component.scss' ],
  animations: [ fade(FADE_IN, FADE_DELAY) ],
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
