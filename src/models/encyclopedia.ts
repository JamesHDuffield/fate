import { DocumentReference } from '@angular/fire/firestore';

export interface Encyclopedia {
  text: string;
  owner: DocumentReference;
}