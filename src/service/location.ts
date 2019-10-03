import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth';
import { filter, switchMap, map, first } from 'rxjs/operators';
import { Location } from '../models/location';
import { Zone } from '../models/zone';

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
}
