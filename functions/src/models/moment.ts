// tslint:disable-next-line: no-implicit-dependencies
import { DocumentReference } from '@google-cloud/firestore';

export interface Option {
  text: string;
  id: number;
  moment?: DocumentReference;
  location?: DocumentReference;
  zone?: DocumentReference;
  flag?: DocumentReference;
  notFlag?: DocumentReference;
}

export interface Moment {
  text: string;
  options: Option[];
  end?: boolean;
  owner?: DocumentReference;
}
