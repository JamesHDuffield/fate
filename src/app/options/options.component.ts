import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoryService } from '../../service/story';
import { Option, Moment } from '../../models/moment';
import { LocationService } from '../../service/location';
import { AuthService } from '../../service/auth';

const MAXIMUM_OPTIONS = 3;

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: [ './options.component.scss' ],
})
export class OptionsComponent implements OnInit {

  disabled = false;
  _moment: Moment = null;
  locations$ = this.location.locations$;
  zones$ = this.location.zones$;

  @Input() set moment(value: Moment) {
    this._moment = value;
    console.log(this._moment);
    this.disabled = false;
  }

  form = new FormGroup({
    id: new FormControl(null, []),
    text: new FormControl('', [ Validators.required ]),
    type: new FormControl('moment', [ Validators.required ]),
    location: new FormControl(null, []),
    name: new FormControl(null, []),
    zone: new FormControl(null, []),
  });

  constructor(private story: StoryService, private location: LocationService, private auth: AuthService) { }

  ngOnInit() {
    this.form.disable();
  }

  get showAddOptionButton(): boolean {
    return !this._moment.end && this.form.disabled && this._moment.options.length < MAXIMUM_OPTIONS;
  }

  async next(option: Option) {
    this.disabled = true;
    await this.story.progressToOption(option)
      .catch((e) => this.disabled = false);
  }

  async add() {
    this.form = new FormGroup({
      id: new FormControl(null, []),
      text: new FormControl('', [ Validators.required ]),
      type: new FormControl('moment', [ Validators.required ]),
      location: new FormControl(null, []),
      name: new FormControl(null, []),
      zone: new FormControl(null, []),
    });
    this.form.enable();
  }

  async save() {
    if (this.form.invalid) {
      return;
    }
    this.disabled = true;
    if (this.form.value.id !== null) {
      await this.story.updateOption(this.form.value)
        .catch((e) => this.disabled = false);
    } else {
      await this.story.createMoment(this.form.value)
        .catch((e) => this.disabled = false);
    }
  }

  async respawn() {
    this.disabled = true;
    return this.story.respawn()
      .catch((e) => this.disabled = false);
  }

  async edit(event: MouseEvent, option: Option) {
    event.preventDefault();
    if (!this.auth.admin) {
      return;
    }
    const type = option.zone ? 'zone' : (option.location ? 'location' : 'moment');
    this.form = new FormGroup({
      id: new FormControl(option.id, []),
      text: new FormControl(option.text, [ Validators.required ]),
      type: new FormControl(type, [ Validators.required ]),
      location: new FormControl(option.location, []),
      name: new FormControl(null, []),
      zone: new FormControl(option.zone, []),
    });
    this.form.enable();
  }

  async delete() {
    return this.story.deleteOption(this._moment.options[this.form.value.id]);
  }

}
