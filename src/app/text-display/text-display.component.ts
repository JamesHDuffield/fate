import { Component, Input } from '@angular/core';
import { EncyclopediaService } from '../../service/encyclopedia';

interface TextDisplayPart {
  text?: string;
  tip?: string;
}

@Component({
  selector: 'app-text-display',
  templateUrl: './text-display.component.html',
  styleUrls: [ './text-display.component.scss' ],
})
export class TextDisplayComponent {

  _cachedRead: TextDisplayPart[] = [];

  @Input() set text(value: string) {
    // tslint:disable-next-line: no-floating-promises
    this.read(value);
  }

  constructor(private encyclopedia: EncyclopediaService) { }

  async read(text: string): Promise<void> {
    text = text.replace('\n', '<br/><br/>');
    if (!this._cachedRead.length) {
      this._cachedRead = [{ text: text.replace(/`/g, '') }]; // load immediately
    }
    const splitted = text.split('`');
    const promiseArray = splitted.map(async (part, i): Promise<TextDisplayPart> => {
      // tslint:disable-next-line: no-magic-numbers
      if (i % 2) {
        const tip = await this.encyclopedia.lookup(part);
        return { text: part, tip };
      }
      return { text: part };
    });
    const readArray = await Promise.all(promiseArray);
    this._cachedRead = readArray.filter((field) => !!field.text);
  }

}
