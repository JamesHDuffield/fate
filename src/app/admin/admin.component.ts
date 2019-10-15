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

  locations$ = this.location.locations$;

  form = new FormGroup({
    locationRef: new FormControl(null, Validators.required),
  });

  zoneForm = new FormGroup({
    name: new FormControl(null, Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<AdminComponent>, private story: StoryService, private location: LocationService, private snack: MatSnackBar) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  goToLocation() {
    this.form.disable();
    console.log('Going to location');
    return this.story.respawn(this.form.value)
      .then(() => this.dialogRef.close())
      .catch((e) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
        this.form.enable();
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
