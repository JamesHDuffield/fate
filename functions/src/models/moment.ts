import { DocumentReference } from '@google-cloud/firestore';

export interface Option {
  text: string;
  id: string;
  moment: DocumentReference
  editing?: boolean;
}

export interface Moment {
  text: string;
  options: Option[];
}
