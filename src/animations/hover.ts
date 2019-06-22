import { trigger, style, state, transition, animate } from '@angular/animations';

export function hover (fadeInMs: number, fadeOutMs: number) {
  return trigger('hover', [
    state('*', style({ opacity: 1 })),
    transition(':enter', [
      style({ opacity: 0 }),
      animate(`${fadeInMs}ms ${fadeOutMs}ms`),
    ]),
    transition(':leave', animate(fadeOutMs, style({ opacity: 0 }))),
  ]);
}
