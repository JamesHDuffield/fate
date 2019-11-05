import { DocumentReference } from '@angular/fire/firestore';
import { BaseDocument } from './base';

export interface Encyclopedia extends BaseDocument {
  text: string;
  owner: DocumentReference;
}
