import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmData {
  text: string;
  cancelButtonText?: string;
  okButtonText?: string;
}

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: [ './confirm.component.scss' ],
})
export class ConfirmComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmData) {
    console.log(data);
  }

  confirm(answer: boolean) {
    this.dialogRef.close(answer);
  }

}
