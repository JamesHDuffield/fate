import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tab-button',
  templateUrl: './tab-button.component.html',
  styleUrls: [ './tab-button.component.scss' ],
})
export class TabButtonComponent {

  @Input()
  icon: string;

  @Input()
  disabled: boolean;

  @Output()
  clicked: EventEmitter<void> = new EventEmitter<void>();

}
