import { Component } from '@angular/core';
import { AuthService } from '../../service/auth';
import { StoryService } from '../../service/story';
import { MatDialog } from '@angular/material';
import { LocationComponent } from '../location/location.component';
import { User } from '../../models/user';
import { AccountComponent } from '../account/account.component';
import { AdminComponent } from '../admin/admin.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ],
})
export class HeaderComponent {

  currentLocation$ = this.story.currentLocation$;
  zone$ = this.story.zone$;

  constructor(public auth: AuthService, private story: StoryService, private dialog: MatDialog) {}

  openLocationDialog(location: Location): void {
    this.dialog.open(LocationComponent, {
      width: '80vw',
      maxWidth: 800,
      data: location,
    });
  }

  openAccountDialog(user: User): void {
    this.dialog.open(AccountComponent, {
      width: '80vw',
      maxWidth: 800,
      data: user,
    });
  }

  openAdminDialog() {
    this.dialog.open(AdminComponent, {
      width: '80vw',
      maxWidth: 800,
    });
  }

}
