import { User } from '../models/user';
import { Moment, Option } from '../models/moment';
import { Location } from '../models/location';
import { DocumentReference } from '@google-cloud/firestore';

const RESPAWN_ZONE = '/zones/lPtHuBdQJZ1DRONwtBIH'
const RESPAWN_LOCATION = '/zones/lPtHuBdQJZ1DRONwtBIH/locations/QpxWih4cW4w3fSHDl3k0'

export class DatabaseService {

  respawnPoint: DocumentReference;

  constructor(private firestore: FirebaseFirestore.Firestore) {
    this.respawnPoint = this.firestore.doc(RESPAWN_LOCATION);
  }

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

  async user(uid: string): Promise<User> {
    const ref = await this.firestore.doc(`/users/${uid}`).get();
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

  async addOption(currentRef: DocumentReference, option: Partial<Option>): Promise<void> {
    const current = await this.getRef<Moment>(currentRef);
    option.id = Math.max(-1, ...current.options.map((opt)=> opt.id)) + 1;
    current.options.push(option as Option);
    await currentRef.set(<any>{ options: current.options }, { merge: true })
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

