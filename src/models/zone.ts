import { Location } from './location';
import { DocumentReference } from '@angular/fire/firestore';
import { BaseDocument } from './base';

export interface Zone extends BaseDocument {
  name: string;
  locations: Location[];
  owner?: DocumentReference;
}
