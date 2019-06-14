import { Component } from '@angular/core';
import { AuthService } from '../service/auth';
import { LocationService } from '../service/location';
import { StoryService } from '../service/story';
import { MatDialog } from '@angular/material/dialog';
import { LocationComponent } from './location/location.component';
import { Location } from '../models/location';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent {
  user$ = this.auth.user$;
  zone$ = this.location.zone$;
  location$ = this.location.currentLocation$;
  storyService = this.story;

  constructor(private auth: AuthService, private location: LocationService, private story: StoryService, public dialog: MatDialog) {}

  openLocationDialog(location: Location): void {

    this.dialog.open(LocationComponent, {
      width: '40vw',
      data: location,
    });
  }

}
