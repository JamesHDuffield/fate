import { Location } from './location';
import { DocumentReference } from '@angular/fire/firestore';
import { BaseDocument } from './base';

export interface Zone extends BaseDocument {
  name: string;
  location: DocumentReference;
  locations: Location[];
  owner?: DocumentReference;
}
