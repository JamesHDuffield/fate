import { Injectable } from '@angular/core';
import { AuthService } from './auth';
import { filter, switchMap, map, first } from 'rxjs/operators';
import { Location } from '../models/location';
import { Zone } from '../models/zone';
import { Moment } from '../models/moment';
import { FirestoreService } from './firestore';

@Injectable({
  providedIn: 'root',
})
export class LocationService {

  zones$ = this.firestore.collection<Zone>('zones');

  zone$ = this.auth.user$
    .pipe(
      filter((user) => !!user && !!user.moment),
      switchMap((user) => this.firestore.fetch(user.moment.parent.parent.parent.parent)),
    );

  locations$ = this.auth.user$
    .pipe(
      filter((user) => !!user && !!user.moment),
      switchMap((user) => this.firestore.document<Zone>(user.moment.parent.parent.parent.parent)),
      map((zoneDoc) => zoneDoc
        .collection<Location>('locations')
        .ref,
      ),
      switchMap((collectionRef) => this.firestore.collection(collectionRef.path)),
    );

  currentLocation$ = this.auth.user$
    .pipe(
      filter((user) => !!user && !!user.moment),
      switchMap((user) => this.firestore.fetch<Location>(user.moment.parent.parent)),
    );

  constructor(private firestore: FirestoreService, private auth: AuthService) {}

  async updateLocation(location: Location): Promise<void> {
    return this.firestore.saveDocument(location);
  }

  async createZone(zone: Zone): Promise<void> {
    const moment: Moment = { text: '', options: [] };
    const location: Location = { name: 'Outdoors', moment: null };
    // Get user
    const user = await this.auth.user$
      .pipe(
        first(),
      )
      .toPromise();
    zone.owner = user.ref;
    location.owner = user.ref;
    moment.owner = user.ref;
    const zoneRef = await this.firestore.createDocument<Zone>('zones', zone);
    const locationRef = await this.firestore.createDocument<Location>(zoneRef.collection('locations').path, location);
    await zoneRef.update({ location: locationRef });
    const momentRef = await this.firestore.createDocument<Moment>(locationRef.collection('moments').path, moment);
    await locationRef.update({ moment: momentRef });
  }
}
