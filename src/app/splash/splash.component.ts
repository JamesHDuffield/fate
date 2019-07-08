import { Component, Input } from '@angular/core';
import { fade } from '../../animations/fade';
import { AuthService } from '../../service/auth';

const FADE_IN = 1000;
const FADE_DELAY = 300;

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: [ './splash.component.scss' ],
  animations: [ fade(FADE_IN, FADE_DELAY) ],
})
export class SplashComponent {
  @Input()
  loaded: boolean;
  hide: boolean;
  constructor(private auth: AuthService) {}

  async click() {
    if (this.loaded) {
      await this.auth.login();
      this.hide = true;
    }
  }
}
