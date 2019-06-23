import { Component } from '@angular/core';
import { AuthService } from '../service/auth';
import { fade } from '../animations/fade';

const FADE_DURATION = 1000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
  animations: [ fade(FADE_DURATION, FADE_DURATION) ],
})
export class AppComponent {

  constructor(public auth: AuthService) {}

}
