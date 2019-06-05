import { User } from '../models/user';
import { Moment, Option } from '../models/moment';
import { Location } from '../models/location';
import { DocumentReference } from '@google-cloud/firestore';

export class DatabaseService {

  constructor(private firestore: FirebaseFirestore.Firestore) { }

  async user(uid: string): Promise<User> {
    console.log(uid);
    const ref = await this.firestore.doc(`/users/${uid}`).get();
    console.log(ref);
    return ref.data() as User;
  }

  async userToMoment(uid: string, momentRef: DocumentReference): Promise<void> {
    await this.firestore.doc(`/users/${uid}`)
      .set({
        moment: momentRef,
      }, { merge: true });
  }

  async userToLocation(uid: string, locationRef: DocumentReference): Promise<void> {
    const location = await locationRef.get();
    await this.firestore.doc(`/users/${uid}`)
      .set({
        location: locationRef,
        moment: location.data().moment,
      }, { merge: true })
  }

  async getRef<T>(docRef: DocumentReference): Promise<T> {
    const ref = await docRef.get();
    return ref.data() as T;
  }

  async moment(id: string): Promise<DocumentReference> {
    return this.firestore.doc(`/moment/${id}`);
  }

  async createMoment(text: string): Promise<DocumentReference> {
    const moment = {
      text,
      options: [],
    }
    return this.firestore.collection('moment').add(moment);
  }

  async createLocation(zone: DocumentReference, location: Location): Promise<DocumentReference> {
    return zone.collection('locations').add(location);
  }

  async addOption(originRef: DocumentReference, moment: Moment, momentRef: DocumentReference, text: string): Promise<void> {
    const maxId = Math.max(-1, ...moment.options.map((opt)=> opt.id)) + 1;
    const option: Option = {
      text,
      moment: momentRef,
      id: maxId,
    }
    moment.options.push(option);
    await originRef.set(<any>{ options: moment.options }, { merge: true })
  }

  async getLocationByXY(x: number, y: number): Promise<DocumentReference> {
    const found = await this.firestore.collection('location')
      .where('x', '==', x)
      .where('y', '==', y)
      .limit(1)
      .get();
    return found.empty ? null : found.docs[0].ref;
  }

}

