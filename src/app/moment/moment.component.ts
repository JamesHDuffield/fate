import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Moment } from '../../models/moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoryService } from '../../service/story';
import { MarkdownService } from 'ngx-markdown';
import { EncyclopediaService } from '../../service/encyclopedia';

interface TextDisplayPart {
  text?: string;
  tip?: string;
}

@Component({
  selector: 'app-moment',
  templateUrl: './moment.component.html',
  styleUrls: [ './moment.component.scss' ],
})
export class MomentComponent implements OnInit {

  _moment: Moment;
  _cachedRead: TextDisplayPart[] = [];
  _cachedEncyclopedia: TextDisplayPart[] = [];

  @ViewChild('editor')
  editor: ElementRef;

  @Input() set moment(value: Moment) {
    this._moment = value;
    this.form.disable();
    // tslint:disable-next-line: no-floating-promises
    this.read();
  }

  form = new FormGroup({
    text: new FormControl('', Validators.required),
    end: new FormControl(false),
    encyclopedias: new FormGroup({}),
  });

  constructor(public story: StoryService, private encyclopedia: EncyclopediaService, private markdown: MarkdownService) { }

  ngOnInit() {
    this.form.disable();
    this.form.get('text').valueChanges
      .subscribe(() => this.updateEncyclopedias());
  }

  async read(): Promise<void> {
    const splitted = this._moment.text.split('`');
    const promiseArray = splitted.map(async (text, i): Promise<TextDisplayPart> => {
      // tslint:disable-next-line: no-magic-numbers
      if (i % 2) {
        const tip = await this.encyclopedia.lookup(text);
        return { text, tip };
      }
      return { text };
    });
    const readArray = await Promise.all(promiseArray);
    this._cachedRead = readArray.filter((field) => !!field.text);
  }

  syncFormControlsForEncyclopedias() {
    const group = this.form.get('encyclopedias') as FormGroup;

    for (const key of Object.keys(group.controls)) {
      console.log(key);
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

  getFormGroupKeys() {
    const group = this.form.get('encyclopedias') as FormGroup;
    return Object.keys(group.controls);
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
    if (text[finish - 1] === ' ') {
      finish--;
    }
    const output = text.slice(0, start) + '`' + text.slice(start, finish) + '`' + text.slice(finish);
    this.form.get('text')
      .setValue(output);
  }

  edit() {
    this.form.get('text')
      .setValue(this._moment.text);
    this.form.get('end')
      .setValue(!!this._moment.end);
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
