import { Location } from './location';
import { DocumentReference } from '@angular/fire/firestore';

export interface Zone {
  name: string;
  locations: Location[];
  owner?: DocumentReference;
}
