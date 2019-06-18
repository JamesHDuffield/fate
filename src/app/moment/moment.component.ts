import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Moment } from '../../models/moment';
import { FormGroup, FormControl } from '@angular/forms';
import { StoryService } from '../../service/story';
import { MarkdownService, MarkedRenderer } from 'ngx-markdown';

interface TextDisplayPart {
  text: string;
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

  @ViewChild('editor')
  editor: ElementRef;

  @Input() set moment(value: Moment) {
    this._moment = value;
    this.form.disable();
    this._cachedRead = this.read();
  }

  form = new FormGroup({
    text: new FormControl(''),
    end: new FormControl(false),
  });

  constructor(public story: StoryService, private markdown: MarkdownService) { }

  ngOnInit() {
    this.form.disable();
  }

  read(): TextDisplayPart[] {
    const splitted = this._moment.text.split('`');
    const readArray = splitted.map((text, i) => {
      if (i % 2) {
        return { text, tip: 'This is a tip' };
      }
      return { text };
    });
    return readArray.filter((field) => !!field.text);
  }

  getSel() {
    const start = this.editor.nativeElement.selectionStart;
    let finish = this.editor.nativeElement.selectionEnd;
    if (this.editor.nativeElement.value[finish - 1] === ' ') {
      finish--;
    }
    this.editor.nativeElement.value = this.editor.nativeElement.value.slice(0, start) + '`' + this.editor.nativeElement.value.slice(start);
    this.editor.nativeElement.value = this.editor.nativeElement.value.slice(0, finish + 1) + '`' + this.editor.nativeElement.value.slice(finish + 1);
  }

  edit() {
    this.form.setValue({
      text: this._moment.text,
      end: !!this._moment.end,
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
