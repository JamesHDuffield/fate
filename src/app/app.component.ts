import { Component, OnInit } from '@angular/core';
import { StoryService } from 'src/service/story';
import { Moment } from 'src/models/moment';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  moments: Moment[] = [];
  customOption = false;
  customText = false;

  text = new FormControl('', []);
  optionText = new FormControl('', []);

  get current(): Moment {
    return this.moments[this.moments.length - 1];
  }

  set current(moment: Moment) {
    this.moments[this.moments.length - 1] = moment;
  }

  constructor(public story: StoryService) {
  }

  ngOnInit() {
    this.next('28XpmJyD2JUkNr9eNyKA');
  }

  async next(id: string) {
    this.customText = false;
    this.customOption = false;
    const moment = await this.story.fetchMoment(id);
    if (!moment) {
      return console.log('This is the end of the story');
    }
    this.moments.push(moment);
  }

  edit() {
    this.text.setValue(this.current.text);
    this.customText = true;
  }

  add() {
    this.customOption = true;
  }

  async saveOption() {
    if (!this.optionText.value) {
      return;
    }
    const moment = await this.story.createMoment(this.optionText.value);
    if (!moment) {
      return console.log('Failure to create');
    }
    this.customOption = false;
    this.moments.push(moment);
    this.customText = true;
  }

  async saveText() {
    if (!this.text.value) {
      return;
    }
    this.current = await this.story.updateMomentText(this.text.value);
    this.customText = false;
  }
}
