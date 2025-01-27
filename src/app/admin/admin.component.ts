import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { StoryService } from '../../service/story';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: [ './admin.component.scss' ],
})
export class AdminComponent {
  menu: string = null;
  locations$ = this.story.locations$;
  zones$ = this.story.zones$;

  zoneForm = new FormGroup({
    name: new FormControl(null, Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<AdminComponent>, private story: StoryService, private snack: MatSnackBar) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  goToLocation(locationRef: string) {
    console.log('Going to location');
    this.dialogRef.close();
    return this.story.respawn({ locationRef })
      .catch((e) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
      });
  }

  goToZone(zoneRef: string) {
    console.log('Going to zone');
    this.dialogRef.close();
    return this.story.respawn({ zoneRef })
      .catch((e) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
      });
  }

  createZone() {
    this.zoneForm.disable();
    console.log('Creating zone');
    this.dialogRef.close();
    return this.story.createZone({ name: this.zoneForm.value.name, location: null, locations: [] })
      .then(() => this.snack.open('Zone created', 'Dismiss'))
      .catch((e) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
        this.zoneForm.enable();
      });
  }

}
