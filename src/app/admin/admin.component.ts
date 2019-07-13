import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
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

  constructor(public dialogRef: MatDialogRef<AdminComponent>, private story: StoryService, private location: LocationService) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  respawn() {
    const body = this.form.value;
    this.form.disable();
    return this.story.respawn(body)
      .then(() => this.dialogRef.close())
      .catch(() => this.form.enable());
  }

}
