import { DocumentReference } from '@angular/fire/firestore';
import { BaseDocument } from './base';

export interface User extends BaseDocument {
  admin?: boolean;
  username?: string;
  zone?: DocumentReference;
  location?: DocumentReference;
  moment?: DocumentReference;
  flags?: DocumentReference[];
}
