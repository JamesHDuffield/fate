import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { fade } from '../../animations/fade';
import { AuthService } from '../../service/auth';
import { PwaInstaller } from '../../service/pwa-installer';
import { MatSnackBar } from '@angular/material';

const FADE_IN = 1000;
const FADE_DELAY = 300;
const DELAY_FOR_INSTALL_ALERT = 1500;
const DURATION_FOR_INSTALL_ALERT = 10000;

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
  constructor(private auth: AuthService, private pwaInstaller: PwaInstaller, private snack: MatSnackBar) {}

  ngAfterViewInit() {
    if (this.pwaInstaller.isPromptable) {
      setTimeout(() => this.snack.open('Install fate as an application?', 'Install', { panelClass: 'primary-snackbar', duration: DURATION_FOR_INSTALL_ALERT })
        .onAction()
        .subscribe(() => this.pwaInstaller.installApp()), DELAY_FOR_INSTALL_ALERT);
    }
  }

  click() {
    if (this.loaded) {
      this.auth.login();
      this.hide = true;
    }
  }
}
