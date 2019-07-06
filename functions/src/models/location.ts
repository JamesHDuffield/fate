// tslint:disable-next-line: no-implicit-dependencies
import { DocumentReference } from "@google-cloud/firestore";

export interface Location {
  moment: DocumentReference;
  name?: string;
  owner?: DocumentReference;
}
