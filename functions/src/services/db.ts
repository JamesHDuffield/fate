import { User } from '../models/user';
import { Moment, Option } from '../models/moment';
import { DocumentReference } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';

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

  async addOption(originRef: DocumentReference, moment: Moment, momentRef: DocumentReference, text: string): Promise<void> {
    const option: Option = {
      text,
      moment: momentRef,
      id: momentRef.id,
    }
    moment.options.push(option);
    await originRef.set(<any>{ options: moment.options }, { merge: true })
  }
}