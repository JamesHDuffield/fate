import { trigger, style, state, transition, animate } from '@angular/animations';

export function fade (fadeInMs: number, fadeOutMs: number) {
  return trigger('fade', [
    state('*', style({ opacity: 1 })),
    transition(':enter', [
      style({ opacity: 0 }),
      animate(`${fadeInMs}ms ${fadeOutMs}ms`),
    ]),
    transition(':leave', animate(fadeOutMs, style({ opacity: 0 }))),
  ]);
}

export const fader = trigger('fader', [
  state('in', style({ opacity: 1 })),
  transition('out => in', [
    style({ opacity: 0 }),
    animate('1000ms 1000ms'),
  ]),
  transition('in => out', animate('1000ms', style({ opacity: 0 }))),
]);
