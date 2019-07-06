import { User } from '../models/user';
import { Moment, Option } from '../models/moment';
import { Location } from '../models/location';
// tslint:disable-next-line: no-implicit-dependencies
import { DocumentReference } from '@google-cloud/firestore';

const RESPAWN_LOCATION = '/zones/lPtHuBdQJZ1DRONwtBIH'

export class DatabaseService {

  respawnPoint: DocumentReference;

  constructor(private firestore: FirebaseFirestore.Firestore) {
    this.respawnPoint = this.firestore.doc(RESPAWN_LOCATION);
  }

  // Util

  async getRef<T>(docRef: DocumentReference): Promise<T> {
    const ref = await docRef.get();
    return ref.data() as T;
  }

  async user(uid: string): Promise<User> {
    const ref = await this.firestore.doc(`/users/${uid}`).get();
    return ref.data() as User;
  }

  // Move user

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
        zone: locationRef.parent.parent,
        location: locationRef,
        moment: location.data().moment,
      }, { merge: true })
  }

  async userToZone(uid: string, zoneRef: DocumentReference): Promise<void> {
    const zone = await zoneRef.get();
    const location: FirebaseFirestore.DocumentSnapshot = await zone.data().location.get();
    const momentRef: DocumentReference = location.data().moment;
    await this.firestore.doc(`/users/${uid}`)
      .set({
        zone: zone.ref,
        location: location.ref,
        moment: momentRef,
      }, { merge: true })
  }

  // Creation

  async createUser(uid: string, username: string): Promise<void> {
    const ref = this.firestore.doc(`/users/${uid}`)
    const doc = await ref.get();
    if (doc.exists) {
      return;
    }
    const user: User = {
      username,
    };
    await ref.set(user);
    await this.userToLocation(uid, this.respawnPoint);
  }

  async createMoment(uid: string, text: string): Promise<DocumentReference> {
    const moment = {
      owner: this.firestore.doc(`/users/${uid}`),
      text,
      options: [],
    }
    return this.firestore.collection('moment').add(moment);
  }

  async createLocation(zone: DocumentReference, location: Location): Promise<DocumentReference> {
    return zone.collection('locations').add(location);
  }

  async addOption(currentRef: DocumentReference, option: Partial<Option>): Promise<void> {
    const current = await this.getRef<Moment>(currentRef);
    option.id = Math.max(-1, ...current.options.map((opt)=> opt.id)) + 1;
    current.options.push(option as Option);
    await currentRef.set(<any>{ options: current.options }, { merge: true })
  }

}

