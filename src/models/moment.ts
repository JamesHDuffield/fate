import { DocumentReference } from '@angular/fire/firestore';

export interface Option {
  text: string;
  id: number;
  moment?: DocumentReference;
  location?: DocumentReference;
  zone?: DocumentReference;
  flags?: DocumentReference[];
  notFlags?: DocumentReference[];
}

export interface Moment {
  text: string;
  options: Option[];
  end?: boolean;
  owner?: DocumentReference;
}
