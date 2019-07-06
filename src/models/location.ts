
export interface Location {
  moment: firebase.firestore.DocumentReference;
  name?: string;
  owner?: firebase.firestore.DocumentReference;
}
