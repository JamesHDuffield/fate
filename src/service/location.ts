import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth';
import { filter, switchMap, map, first, tap } from 'rxjs/operators';
import { Location } from '../models/location';
import { Zone } from '../models/zone';
import { Moment } from '../models/moment';

@Injectable({
  providedIn: 'root',
})
export class LocationService {

  zones$ = this.auth.user$
    .pipe(
      filter((user) => !!user),
      switchMap(() => this.db.collection<Zone>('zones')
        .get(),
      ),
      map((query) => query.docs
        .map((doc) => ({ ref: doc.ref.path, name: doc.data().name }))
        .filter((doc) => doc.name),
      ),
    );

  zone$ = this.auth.user$
    .pipe(
      filter((user) => !!user && !!user.moment),
      switchMap((user) => this.db.doc(user.moment.parent.parent.parent.parent)
        .valueChanges()),
    );

  locations$ = this.auth.user$
    .pipe(
      filter((user) => !!user && !!user.moment),
      switchMap((user) => this.db.doc(user.moment.parent.parent.parent.parent)
        .collection<Location>('locations')
        .get(),
      ),
      map((query) => query.docs
        .map((doc) => ({ ref: doc.ref.path, name: doc.data().name }))
        .filter((doc) => doc.name),
      ),
    );

  currentLocation$ = this.auth.user$
    .pipe(
      filter((user) => !!user && !!user.moment),
      switchMap((user) => this.db.doc<Location>(user.moment.parent.parent)
        .valueChanges()),
    );

  constructor(private db: AngularFirestore, private auth: AuthService) {}

  async updateLocation(location: Partial<Location>): Promise<void> {
    return this.auth.user$
      .pipe(
        map((user) => this.db.doc<Location>(user.moment.parent.parent)),
        first(),
        switchMap((locationDoc) => locationDoc.set(<Location>location, { merge: true })),
      )
      .toPromise();
  }

  async createZone(zone: Partial<Zone>): Promise<any> {
    const moment: Partial<Moment> = { text: '', options: [] };
    const location: Partial<Location> = { name: 'Outdoors' };

    return this.auth.userDoc$
      .pipe(
        first(),
        tap((userDoc) => {
          zone.owner = userDoc.ref;
          location.owner = userDoc.ref;
          moment.owner = userDoc.ref;
        }),
        switchMap(() => this.db.collection<Zone>('zones')
          .add(<Zone>zone)),
        switchMap(async (zoneRef) => {
          const locationRef = await zoneRef.collection('locations')
            .add(location);
          await zoneRef.update({ location: locationRef });
          return locationRef;
        }),
        switchMap(async (locationRef) => {
          const momentRef = await locationRef.collection('moments')
            .add(moment);
          await locationRef.update({ moment: momentRef });
        }),
      )
      .toPromise();
  }
}
