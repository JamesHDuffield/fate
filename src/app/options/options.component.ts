import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoryService } from '../../service/story';
import { Option, Moment } from '../../models/moment';
import { LocationService } from '../../service/location';
import { AuthService } from '../../service/auth';
import { MatDialog } from '@angular/material';
import { ConfirmComponent, ConfirmData } from '../confirm/confirm.component';
import { FlagComponent } from '../flag/flag.component';
import { ChooseComponent } from '../flag/choose/choose.component';
import { Observable } from 'rxjs';

const MAXIMUM_OPTIONS = 3;

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {

  _moment: Moment = null;
  locations$ = this.location.locations$;
  zones$ = this.location.zones$;

  @Input() set moment(value: Moment) {
    this._moment = value;
    this.form.disable();
  }

  form = new FormGroup({
    id: new FormControl(null, []),
    text: new FormControl('', [Validators.required]),
    type: new FormControl('moment', [Validators.required]),
    location: new FormControl(null, []),
    name: new FormControl(null, []),
    zone: new FormControl(null, []),
  });

  flag$: Observable<string>;

  constructor(private story: StoryService, private location: LocationService, private auth: AuthService, private dialog: MatDialog) { }

  ngOnInit() {
    this.form.disable();
  }

  get showAddOptionButton(): boolean {
    return !this._moment.end && this.form.disabled && this._moment.options.length < MAXIMUM_OPTIONS;
  }

  async next(option: Option) {
    this.form.disable();
    await this.story.progressToOption(option)
      .catch((e) => this.form.enable());
  }

  async add() {
    this.form = new FormGroup({
      id: new FormControl(null, []),
      text: new FormControl('', [Validators.required]),
      type: new FormControl('moment', [Validators.required]),
      location: new FormControl(null, []),
      name: new FormControl(null, []),
      zone: new FormControl(null, []),
      flag: new FormControl(null, []),
      notFlag: new FormControl(null, []),
    });
    this.form.enable();
  }

  async save() {
    if (this.form.invalid) {
      return;
    }
    this.form.disable();
    if (this.form.value.id !== null) {
      await this.story.updateOption(this.form.value)
        .catch((e) => this.form.enable());
    } else {
      await this.story.createMoment(this.form.value)
        .catch((e) => this.form.enable());
    }
  }

  async respawn() {
    this.form.disable();
    return this.story.respawn()
      .catch((e) => this.form.enable());
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
      flag: new FormControl(option.flag, []),
      notFlag: new FormControl(option.notFlag, []),
    });
    this.form.enable();
    this.form.get('type')
      .disable();
    this.form.get('location')
      .disable();
    this.form.get('zone')
      .disable();
  }

  async delete() {
    const data: ConfirmData = {
      text: 'Are you sure you wish to delete this option?',
      okButtonText: 'Delete',
    };
    return this.dialog.open(ConfirmComponent, { data })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          return this.story.deleteOption(this._moment.options[this.form.value.id]);
        }
      });
  }

  async createFlag(key: string = 'flag') {
    return this.dialog.open(FlagComponent, { maxWidth: '100vw', width: '750px', maxHeight: '100vh' })
      .afterClosed()
      .subscribe((result) => {
        const patch = {};
        patch[key] = result || null;
        this.form.patchValue(patch);
      });
  }

  async chooseFlag(key: string = 'flag') {
    return this.dialog.open(ChooseComponent, { maxWidth: '100vw', width: '750px', maxHeight: '100vh' })
      .afterClosed()
      .subscribe((result) => {
        const patch = {};
        patch[key] = result || null;
        this.form.patchValue(patch);
      });
  }

}
