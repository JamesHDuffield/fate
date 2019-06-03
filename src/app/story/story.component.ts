import { Component } from '@angular/core';
import { StoryService } from '../../service/story';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormControl } from '@angular/forms';
import { Option } from '../../models/moment';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: [ './story.component.scss' ],
  animations: [
    trigger('triggerName', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms 300ms'),
      ]),
      transition(':leave', animate(300, style({ opacity: 0 }))),
    ]),
  ],
})
export class StoryComponent {
  customOption = false;
  customText = false;
  text = new FormControl('', []);
  optionText = new FormControl('', []);
  current$ = this.story.current$;

  constructor(private story: StoryService) { }

  async next(option: Option) {
    this.customText = false;
    this.customOption = false;
    await this.story.progressToOption(option);
  }

  edit(text: string) {
    this.text.setValue(text);
    this.customText = true;
  }

  add() {
    this.customOption = true;
  }

  async saveOption() {
    if (!this.optionText.value) {
      return;
    }
    await this.story.createMoment(this.optionText.value);
    this.customOption = false;
    this.customText = true;
  }

  async saveText() {
    if (!this.text.value) {
      return;
    }
    await this.story.updateMomentText(this.text.value);
    this.customText = false;
  }
}
