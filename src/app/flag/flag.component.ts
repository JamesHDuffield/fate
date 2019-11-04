import { Component } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { sample } from 'lodash';
import { StoryService } from '../../service/story';

@Component({
  selector: 'app-flag',
  templateUrl: './flag.component.html',
  styleUrls: [ './flag.component.scss' ],
})
export class FlagComponent {

  colorOptions = [
    '#fff4e0',
    '#8fcccb',
    '#449489',
    '#285763',
    '#2f2b5c',
    '#457cd6',
    '#f2b63d',
    '#d46e33',
    '#e34262',
    '#94353d',
    '#57253b',
    '#9c656c',
    '#d1b48c',
    '#b4ba47',
    '#6d8c32',
  ];

  iconOptions = [
    'accessibility',
    'account_balance',
    'alarm',
    'announcement',
    'build',
    'bug_report',
    'card_giftcard',
    'contactless',
    'eco',
    'face',
    'extension',
    'gavel',
    'hourglass_full',
    'grade',
    'lock',
    'lock_open',
    'pan_tool',
    'motorcycle',
    'pets',
    'search',
    'watch_later',
    'store',
    'thumb_up',
    'thumb_down',
    'turned_in',
    'visibility',
    'error',
    'hearing',
    'radio',
    'email',
    'business',
    'vpn_key',
    'drafts',
    'waves',
    'link',
    'format_paint',
    'highlight',
    'scatter_plot',
    'monetization_on',
    'toys',
    'watch',
    'audiotrack',
    'assistant_photo',
    'brightness_2',
    'broken_image',
    'filter_vintage',
    'details',
    'grain',
    'landscape',
    'healing',
    'palette',
    'nature_people',
    'wb_sunny',
  ];

  form = new FormGroup({
    name: new FormControl(null, Validators.required),
    color: new FormControl(sample(this.colorOptions), Validators.required),
    icon: new FormControl(sample(this.iconOptions), Validators.required),
    permanent: new FormControl(false, Validators.required),
  });

  constructor(public dialogRef: MatDialogRef<FlagComponent>, private story: StoryService, private snack: MatSnackBar) { }

  async create() {
    const flag = this.form.value;
    console.log('Creating flag', flag);
    this.form.disable();
    return this.story.createFlag(flag)
      .then((ref) => this.dialogRef.close(ref))
      .catch((e) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
        this.form.enable();
      });
  }

  close() {
    this.dialogRef.close();
  }

}
