import { Component } from '@angular/core';
import { AuthService } from '../../service/auth';
import { LocationService } from '../../service/location';
import { StoryService } from '../../service/story';
import { MatDialog } from '@angular/material';
import { LocationComponent } from '../location/location.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ],
})
export class HeaderComponent {

  constructor(private auth: AuthService, private location: LocationService, private story: StoryService, public dialog: MatDialog) {}

  openLocationDialog(location: Location): void {
    this.dialog.open(LocationComponent, {
      width: '40vw',
      data: location,
    });
  }

}
