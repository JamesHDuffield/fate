import { DocumentReference } from "@google-cloud/firestore";

export interface Location {
  x: number;
  y: number;
  connections?: DocumentReference[];
  N?: boolean;
  S?: boolean;
  E?: boolean;
  W?: boolean;
  road?: boolean;
  moment?: DocumentReference;
}
