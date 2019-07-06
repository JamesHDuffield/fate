import { Location } from './location';
// tslint:disable-next-line:no-implicit-dependencies
import { DocumentReference } from '@google-cloud/firestore';

export interface Zone {
  name: string;
  locations: Location[];
  location: DocumentReference;
}
