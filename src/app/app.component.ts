import { Component } from '@angular/core';
import { AuthService } from '../service/auth';
import { fader } from '../animations/fade';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
  animations: [ fader ],
})
export class AppComponent {

  constructor(public auth: AuthService) {}

}
