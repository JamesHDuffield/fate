import { DocumentReference } from '@angular/fire/firestore';

export interface User {
  admin?: boolean;
  username?: string;
  zone?: DocumentReference;
  location?: DocumentReference;
  moment?: DocumentReference;
  flags?: DocumentReference[];
}
