import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth';
import { fade } from '../animations/fade';
import { PwaInstaller } from '../service/pwa-installer';

const FADE_DURATION = 1000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
  animations: [ fade(FADE_DURATION, FADE_DURATION) ],
})
export class AppComponent implements OnInit {

  constructor(public auth: AuthService, private pwaInstaller: PwaInstaller) {}

  ngOnInit() {
    this.pwaInstaller.startCapturingEvent();
  }

}
