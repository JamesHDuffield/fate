import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { Location } from '../../models/location';
import { LocationService } from '../../service/location';

@Component({
  templateUrl: './location.component.html',
  styleUrls: [ './location.component.scss' ],
})
export class LocationComponent {

  disabled = false;

  form = new FormGroup({
    name: new FormControl(this.data.name),
  });

  constructor(
    public dialogRef: MatDialogRef<LocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Location,
    private locationService: LocationService,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  async submit(): Promise<void> {
    this.disabled = true;
    await this.locationService.updateLocation(this.form.value);
    this.dialogRef.close();
  }

}
