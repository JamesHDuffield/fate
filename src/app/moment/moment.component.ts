import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Moment } from '../../models/moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoryService } from '../../service/story';
import { EncyclopediaService } from '../../service/encyclopedia';
import { fade } from '../../animations/fade';
import { AuthService } from '../../service/auth';
import { MatDialog } from '@angular/material';
import { ChooseComponent } from '../flag/choose/choose.component';
import { FlagComponent } from '../flag/flag.component';

const FADE_IN = 300;

interface TextDisplayPart {
  text?: string;
  tip?: string;
}

@Component({
  selector: 'app-moment',
  templateUrl: './moment.component.html',
  styleUrls: [ './moment.component.scss' ],
  animations: [ fade(FADE_IN, 0) ],
})
export class MomentComponent implements OnInit {

  _cachedEncyclopedia: TextDisplayPart[] = [];

  @ViewChild('editor')
  editor: ElementRef;

  _moment: Moment;

  @Input() set moment(value: Moment) {
    this._moment = value;
    if (value.text === '' && value.owner && value.owner.id === this.auth.uid) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  get moment(): Moment {
    return this._moment;
  }

  form = new FormGroup({
    text: new FormControl('', Validators.required),
    end: new FormControl(false),
    encyclopedias: new FormGroup({}),
    flag: new FormControl(null),
  });

  get encyclopediaKeys() {
    const group = this.form.get('encyclopedias') as FormGroup;
    return Object.keys(group.controls);
  }

  constructor(public story: StoryService, private encyclopedia: EncyclopediaService, private auth: AuthService, private dialog: MatDialog) { }

  ngOnInit() {
    this.form.get('text').valueChanges
      .subscribe(() => this.updateEncyclopedias());
  }

  syncFormControlsForEncyclopedias() {
    const group = this.form.get('encyclopedias') as FormGroup;

    for (const key of Object.keys(group.controls)) {
      if (!this._cachedEncyclopedia.find((enc) => enc.text === key)) {
        // Delete if missing
        group.removeControl(key);
      }
    }

    for (const enc of this._cachedEncyclopedia) {
      if (!group.get(enc.text)) {
        // Add if missing
        const ctrl = new FormControl(enc.tip, Validators.required);
        group.addControl(enc.text, ctrl);
      }
    }
  }

  async updateEncyclopedias(): Promise<void> {
    const value: string = this.form.get('text').value;
    const splitted = value.split('`');
    if (splitted.length % 2) {
      const promiseArray = splitted.map(async (text, i): Promise<TextDisplayPart> => {
        // tslint:disable-next-line: no-magic-numbers
        if (i % 2) {
          const tip = await this.encyclopedia.lookup(text);
          return { text, tip };
        }
        return { text: null };
      });
      const readArray = await Promise.all(promiseArray);
      this._cachedEncyclopedia = readArray.filter((field) => !!field.text);
      this.syncFormControlsForEncyclopedias();
    }
  }

  mark() {
    const start = this.editor.nativeElement.selectionStart;
    let finish = this.editor.nativeElement.selectionEnd;
    const text = this.editor.nativeElement.value;
    if (start === finish) {
      return;
    }
    if (text[finish - 1] === ' ') {
      finish--;
    }
    if (text[start - 1] === '`' && text[finish] === '`') {
      const output = text.slice(0, start - 1) + text.slice(start, finish) + text.slice(finish + 1);
      this.form.get('text')
        .setValue(output);
    } else {
      const output = text.slice(0, start) + '`' + text.slice(start, finish) + '`' + text.slice(finish);
      this.form.get('text')
        .setValue(output);
    }
  }

  edit() {
    this.form.get('text')
      .setValue(this._moment.text);
    this.form.get('end')
      .setValue(!!this._moment.end);
    this.form.get('flag')
      .setValue(this._moment.flag);
    this.form.enable();
  }

  toggle(property: string) {
    const prop = this.form.get(property);
    prop.setValue(!prop.value);
  }

  async save() {
    const value = this.form.value;
    const moment = this._moment;
    moment.text = value.text;
    moment.end = value.end;
    moment.flag = value.flag || null;
    return this.story.updateMoment(moment, value.encyclopedias)
      .then(() => this.form.disable());
  }

  async createFlag(key: string = 'flag') {
    return this.dialog.open(FlagComponent, { maxWidth: '100vw', width: '750px', maxHeight: '100vh' })
      .afterClosed()
      .subscribe((result) => {
        const patch = {};
        patch[key] = result;
        this.form.patchValue(patch);
      });
  }

  async chooseFlag(key: string = 'flag') {
    return this.dialog.open(ChooseComponent, { maxWidth: '100vw', width: '750px', maxHeight: '100vh' })
      .afterClosed()
      .subscribe((result) => {
        const patch = {};
        patch[key] = result;
        this.form.patchValue(patch);
      });
  }

}
