import { DocumentReference } from '@angular/fire/firestore';
import { BaseDocument } from './base';

export interface Option extends BaseDocument {
  text: string;
  id: number;
  moment?: DocumentReference;
  location?: DocumentReference;
  zone?: DocumentReference;
  flag?: DocumentReference;
  notFlag?: DocumentReference;
  passFlag?: boolean;
  passNotFlag?: boolean;
}

export interface Moment extends BaseDocument {
  text: string;
  options: Option[];
  end?: boolean;
  owner?: DocumentReference;
  flag?: DocumentReference;
}
