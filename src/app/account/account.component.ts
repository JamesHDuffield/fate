import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { User } from '../../models/user';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: [ './account.component.scss' ],
})
export class AccountComponent {

  disabled = false;

  form = new FormGroup({
    username: new FormControl(this.data.username),
  });

  constructor(
    public dialogRef: MatDialogRef<AccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private auth: AuthService,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  async submit(): Promise<void> {
    this.disabled = true;
    await this.auth.updateAccount(this.form.value);
    this.dialogRef.close();
  }

  async logout(): Promise<void> {
    this.disabled = true;
    await this.auth.logout();
    this.dialogRef.close();
  }

}
