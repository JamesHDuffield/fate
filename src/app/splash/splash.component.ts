import { Component, Input } from '@angular/core';
import { fade } from '../../animations/fade';
import { AuthService } from '../../service/auth';
import { timer } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: [ './splash.component.scss' ],
  animations: [ fade(1000, 300) ],
})
export class SplashComponent {
  @Input()
  loaded: boolean;
  hide: boolean;
  constructor(private auth: AuthService) {}

  click() {
    if (this.loaded) {
      this.auth.login();
      this.hide = true;
    }
  }
}
