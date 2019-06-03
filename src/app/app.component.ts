import { Component } from '@angular/core';
import { AuthService } from '../service/auth';
import { LocationService } from '../service/location';
import { StoryService } from '../service/story';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent {
  user$ = this.auth.user$;
  zone$ = this.location.zone$;
  storyService = this.story;

  constructor(private auth: AuthService, private location: LocationService, private story: StoryService) {}

}
