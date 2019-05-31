export interface Location {
  x: number;
  y: number;
  connections?: firebase.firestore.DocumentReference[];
  N?: boolean;
  S?: boolean;
  E?: boolean;
  W?: boolean;
  road?: boolean;
}
