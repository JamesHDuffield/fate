import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { StoryService } from '../../service/story';
import { Option, Moment } from '../../models/moment';

const MAXIMUM_OPTIONS = 3;

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: [ './options.component.scss' ],
})
export class OptionsComponent implements OnInit {

  @Input()
  moment: Moment;

  form = new FormGroup({
    text: new FormControl(''),
    type: new FormControl('moment'),
  });

  constructor(private story: StoryService) { }

  ngOnInit() {
    this.form.disable();
  }

  get showAddOptionButton(): boolean {
    return !this.moment.end && this.form.disabled && this.moment.options.length < MAXIMUM_OPTIONS;
  }

  async next(option: Option) {
    await this.story.progressToOption(option);
  }

  async save() {
    if (this.form.invalid) {
      return;
    }
    await this.story.createMoment(this.form.value);
  }

}
