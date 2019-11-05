import { DocumentReference } from '@angular/fire/firestore';
import { BaseDocument } from './base';

export interface Flag extends BaseDocument {
  name: string;
  icon: string;
  color: string;
  permanent?: boolean;
  owner: DocumentReference;
}
