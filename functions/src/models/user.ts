// tslint:disable-next-line: no-implicit-dependencies
import { DocumentReference } from '@google-cloud/firestore';

export interface User {
  admin?: boolean;
  username?: string;
  zone?: DocumentReference;
  location?: DocumentReference;
  moment?: DocumentReference;
}
