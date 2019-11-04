import { DocumentReference } from '@angular/fire/firestore';

export interface Flag {
  ref?: DocumentReference;
  name: string;
  icon: string;
  color: string;
  permanent?: boolean;
  owner: DocumentReference;
}
