import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { Location } from '../../models/location';
import { LocationService } from '../../service/location';
import { AuthService } from '../../service/auth';

@Component({
  templateUrl: './location.component.html',
  styleUrls: [ './location.component.scss' ],
})
export class LocationComponent {

  form = new FormGroup({
    name: new FormControl(this.data.name),
  });

  constructor(
    public dialogRef: MatDialogRef<LocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Location,
    private locationService: LocationService,
    auth: AuthService,
  ) {
    if ((!data.owner || auth.uid !== data.owner.id) && !auth.admin) {
      this.form.disable();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async submit(): Promise<void> {
    this.form.disable();
    await this.locationService.updateLocation(Object.assign(this.data, this.form.value));
    this.dialogRef.close();
  }

}
