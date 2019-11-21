import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Flag } from '../../../models/flag';

@Component({
  selector: 'flag-icon',
  templateUrl: './flag-icon.component.html',
  styleUrls: [ './flag-icon.component.scss' ],
})
export class FlagIconComponent {

  @Input()
  flag: Flag;

  @Input()
  flags: Flag[];

  @Input()
  small: boolean = false;

  @Input()
  prepend: string = '';

  @Input()
  disabled: boolean = false;

  @Output()
  choose: EventEmitter<Flag> = new EventEmitter<Flag>();

  get _flags() {
    return this.flags || (this.flag ? [ this.flag ] : []);
  }

}
