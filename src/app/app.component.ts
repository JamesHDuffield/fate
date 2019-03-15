import { Component, OnInit } from '@angular/core';
import { StoryService } from 'src/service/story';
import { Moment } from 'src/models/moment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  moments: Moment[] = [];

  get current(): Moment {
    return this.moments[this.moments.length - 1];
  }

  constructor(public story: StoryService) {
  }

  ngOnInit() {
    this.next('28XpmJyD2JUkNr9eNyKA');
  }

  async next(id: string) {
    const moment = await this.story.fetchMoment(id);
    if (!moment) {
      return console.log('This is the end of the story');
    }
    this.moments.push(moment);
    console.log(this.current);
  }

  edit(moment: Moment) {
    console.log('Editing not implemented');
  }
}
