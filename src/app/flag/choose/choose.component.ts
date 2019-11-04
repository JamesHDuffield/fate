import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Flag } from '../../../models/flag';
import { StoryService } from '../../../service/story';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-choose',
  templateUrl: './choose.component.html',
  styleUrls: [ './choose.component.scss' ],
})
export class ChooseComponent {

  flags$ = this.story.flags$;

  constructor(public dialogRef: MatDialogRef<ChooseComponent>, private story: StoryService) { }

  choose(flag: Flag) {
    this.dialogRef.close(flag);
  }

}
