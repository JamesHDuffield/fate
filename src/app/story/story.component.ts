import { Component } from '@angular/core';
import { StoryService } from '../../service/story';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormGroup, FormControl } from '@angular/forms';
import { Option } from '../../models/moment';
import { delay, tap, throttleTime } from 'rxjs/operators';

const ANIMATION_DELAY = 300;

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: [ './story.component.scss' ],
  animations: [
    trigger('triggerName', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate(`600ms ${ANIMATION_DELAY}ms`),
      ]),
      transition(':leave', animate(ANIMATION_DELAY, style({ opacity: 0 }))),
    ]),
  ],
})
export class StoryComponent {
  customOption = false;
  customText = false;
  text = new FormControl('');
  hideForAnimation = false;
  optionForm = new FormGroup({
    text: new FormControl(''),
    type: new FormControl('moment'),
  });
  current$ = this.story.current$
    .pipe(
      throttleTime(ANIMATION_DELAY),
      tap(() => {
        this.hideForAnimation = true;
        this.customOption = false;
        this.customText = false;
        this.text.reset();
        this.optionForm.reset();
      }),
      delay(ANIMATION_DELAY),
      tap(() => this.hideForAnimation = false),
    );

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
    if (this.optionForm.invalid) {
      return;
    }
    await this.story.createMoment(this.optionForm.value);
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
