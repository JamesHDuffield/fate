import { Component } from '@angular/core';
import { StoryService } from '../../service/story';
import { delay, tap, throttleTime } from 'rxjs/operators';
import { fade } from '../../animations/fade';

const FADE_IN = 600;
const FADE_OUT = 300;

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: [ './story.component.scss' ],
  animations: [ fade(FADE_IN, FADE_OUT) ],
})
export class StoryComponent {
  hideForAnimation = false;

  current$ = this.story.current$
    .pipe(
      throttleTime(FADE_OUT),
      tap(() => this.hideForAnimation = true),
      delay(FADE_OUT),
      tap(() => this.hideForAnimation = false),
    );

  constructor(private story: StoryService) { }

}
