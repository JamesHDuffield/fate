import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth';
import { filter, switchMap } from 'rxjs/operators';
import { Zone } from '../models/zone';
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
      switchMap((user) => this.db.doc(user.location)
        .valueChanges()),
    );

  constructor(private db: AngularFirestore, private auth: AuthService) {}

}
