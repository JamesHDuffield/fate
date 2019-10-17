import { DocumentReference } from '@angular/fire/firestore';

export interface Flag {
  name: string;
  icon: string;
  color: string;
  permanent?: boolean;
  owner: DocumentReference;
}
