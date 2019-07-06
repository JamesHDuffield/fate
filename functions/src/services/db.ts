import { User } from '../models/user';
import { Moment, Option } from '../models/moment';
import { Location } from '../models/location';
// tslint:disable-next-line: no-implicit-dependencies
import { DocumentReference } from '@google-cloud/firestore';
import { Zone } from '../models/zone';

const RESPAWN_LOCATION = '/zones/lPtHuBdQJZ1DRONwtBIH'

export class DatabaseService {

  respawnPoint: DocumentReference;

  constructor(public firestore: FirebaseFirestore.Firestore) {
    this.respawnPoint = this.firestore.doc(RESPAWN_LOCATION);
  }

  // Util

  async getRef<T>(docRef: DocumentReference): Promise<T> {
    const ref = await docRef.get();
    return ref.data() as T;
  }

  // Move user

  async userToMoment(userRef: DocumentReference, momentRef: DocumentReference): Promise<void> {
    await userRef
      .set({ moment: momentRef }, { merge: true });
  }

  async userToLocation(userRef: DocumentReference, locationRef: DocumentReference): Promise<void> {
    const location = await locationRef.get();
    await userRef
      .set({ moment: location.data().moment}, { merge: true });
  }

  async userToZone(userRef: DocumentReference, zoneRef: DocumentReference): Promise<void> {
    const zone = await zoneRef.get();
    const location: FirebaseFirestore.DocumentSnapshot = await zone.data().location.get();
    const momentRef: DocumentReference = location.data().moment;
    await userRef
      .set({ moment: momentRef }, { merge: true });
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
    await this.userToLocation(ref, this.respawnPoint);
  }

  async createMoment(locationRef: DocumentReference, moment: Moment): Promise<DocumentReference> {
    return locationRef.collection('moments').add(moment);
  }

  async createLocation(zoneRef: DocumentReference, location: Location): Promise<DocumentReference> {
    return zoneRef.collection('locations').add(location);
  }

  async createZone(zone: Zone): Promise<DocumentReference> {
    return this.firestore.collection('zones').add(zone);
  }

  async addOption(currentRef: DocumentReference, option: Partial<Option>): Promise<void> {
    const current = await this.getRef<Moment>(currentRef);
    option.id = Math.max(-1, ...current.options.map((opt)=> opt.id)) + 1;
    current.options.push(option as Option);
    await currentRef.set(<any>{ options: current.options }, { merge: true })
  }

}

