import { Component, Input, OnInit } from '@angular/core';
import { Moment } from '../../models/moment';
import { FormGroup, FormControl } from '@angular/forms';
import { StoryService } from '../../service/story';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-moment',
  templateUrl: './moment.component.html',
  styleUrls: [ './moment.component.scss' ],
})
export class MomentComponent implements OnInit {

  @Input()
  moment: Moment;

  form = new FormGroup({
    text: new FormControl(''),
    end: new FormControl(false),
  });

  constructor(private story: StoryService, private auth: AuthService) { }

  ngOnInit() {
    this.form.disable();
  }

  edit() {
    this.form.setValue({
      text: this.moment.text,
      end: !!this.moment.end,
    });
    this.form.enable();
  }

  toggle(property: string) {
    const prop = this.form.get(property);
    prop.setValue(!prop.value);
  }

  async save() {
    return this.story.updateMoment(this.form.value);
  }

}
