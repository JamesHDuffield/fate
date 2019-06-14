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

  disabled = false;
  _moment: Moment = null;

  @Input() set moment(value: Moment) {
    this._moment = value;
    this.disabled = false;
  }

  form = new FormGroup({
    text: new FormControl(''),
    type: new FormControl('moment'),
  });

  constructor(private story: StoryService) { }

  ngOnInit() {
    this.form.disable();
  }

  get showAddOptionButton(): boolean {
    return !this._moment.end && this.form.disabled && this._moment.options.length < MAXIMUM_OPTIONS;
  }

  async next(option: Option) {
    this.disabled = true;
    await this.story.progressToOption(option);
  }

  async save() {
    if (this.form.invalid) {
      return;
    }
    await this.story.createMoment(this.form.value);
  }

  async respawn() {
    this.disabled = true;
    return this.story.respawn();
  }

}
