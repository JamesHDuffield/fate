import { Component, OnInit } from '@angular/core';
import { StoryService } from 'src/service/story';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Loading';

  constructor(private story: StoryService) {
  }

  ngOnInit() {
    this.next();
  }

  async next() {
    this.title = await this.story.fetchStory();
  }
}
