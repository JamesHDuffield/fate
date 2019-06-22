import { Component } from '@angular/core';
import { fade } from '../../animations/fade';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: [ './splash.component.scss' ],
  animations: [ fade(1000, 0) ],
})
export class SplashComponent {

  constructor(private auth: AuthService) {}

}
