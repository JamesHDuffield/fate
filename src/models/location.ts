import { BaseDocument } from './base';
import { DocumentReference } from '@angular/fire/firestore';

export interface Location extends BaseDocument {
  moment: DocumentReference;
  name?: string;
  owner?: DocumentReference;
}
