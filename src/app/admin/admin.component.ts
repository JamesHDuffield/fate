import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { StoryService } from '../../service/story';
import { LocationService } from '../../service/location';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: [ './admin.component.scss' ],
})
export class AdminComponent {
  menu: string = null;
  locations$ = this.location.locations$;
  zones$ = this.location.zones$;

  zoneForm = new FormGroup({
    name: new FormControl(null, Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<AdminComponent>, private story: StoryService, private location: LocationService, private snack: MatSnackBar) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  goToLocation(locationRef: string) {
    console.log('Going to location');
    return this.story.respawn({ locationRef })
      .then(() => this.dialogRef.close())
      .catch((e) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
      });
  }

  goToZone(zoneRef: string) {
    console.log('Going to zone');
    return this.story.respawn({ zoneRef })
      .then(() => this.dialogRef.close())
      .catch((e) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
      });
  }

  createZone() {
    this.zoneForm.disable();
    console.log('Creating zone');
    return this.location.createZone({ name: this.zoneForm.value.name })
      .then(() => this.dialogRef.close())
      .catch((e) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
        this.zoneForm.enable();
      });
  }

}
