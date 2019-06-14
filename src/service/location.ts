import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth';
import { filter, switchMap, map, first } from 'rxjs/operators';
import { Location } from '../models/location';

@Injectable({
  providedIn: 'root',
})
export class LocationService {

  zone$ = this.auth.user$
    .pipe(
      filter((user) => !!user && !!user.zone),
      switchMap((user) => this.db.doc(user.zone.path)
        .valueChanges()),
    );

  locations$ = this.auth.user$
    .pipe(
      filter((user) => !!user && !!user.zone),
      switchMap((user) => this.db.doc(user.zone.path)
        .collection<Location>('locations')
        .valueChanges()),
    );

  currentLocation$ = this.auth.user$
    .pipe(
      filter((user) => !!user && !!user.location),
      switchMap((user) => this.db.doc<Location>(user.location)
        .valueChanges()),
    );

  constructor(private db: AngularFirestore, private auth: AuthService) {}

  async updateLocation(location: Partial<Location>): Promise<void> {
    return this.auth.user$
      .pipe(
        map((user) => this.db.doc<Location>(user.location)),
        first(),
        switchMap((locationDoc) => locationDoc.set(<Location>location, { merge: true })),
      )
      .toPromise();
  }
}
