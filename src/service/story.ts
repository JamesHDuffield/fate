import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DocumentReference } from '@angular/fire/firestore';
import { Moment, Option } from '../models/moment';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Observable, combineLatest } from 'rxjs';
import { filter, switchMap, map, first, tap, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from './auth';
import { environment } from '../environments/environment';
import { MatSnackBar } from '@angular/material';
import { Encyclopedia } from '../models/encyclopedia';
import { Flag } from '../models/flag';
import { FirestoreService } from './firestore';
import { Zone } from '../models/zone';
import { Location } from '../models/location';

@Injectable()
export class StoryService {

  // Moment

  current$: Observable<Moment> = this.auth.user$
    .pipe(
      filter((user) => !!user),
      switchMap((user) =>
        this.firestore.fetch<Moment>(user.moment)
          .pipe(
            distinctUntilChanged(),
            tap(async (moment) => {
              if (moment && moment.flag) {
                console.log('Granted a new flag');
                await user.ref.update({
                  flags: firebase.firestore.FieldValue.arrayUnion(moment.flag),
                });
              }
            }),
            tap((moment) => {
              const flagIds = user.flags.map((flag) => flag.id);
              for (const opt of moment.options) {
                opt.passFlag = !opt.flag || flagIds.includes(opt.flag.id);
                opt.passNotFlag = !opt.notFlag || !flagIds.includes(opt.notFlag.id);
              }
            }),
          ),
      ),
    );

  canEditMoment$: Observable<boolean> = combineLatest(this.auth.user$, this.auth.firebaseUser$, this.current$)
    .pipe(
      map(([ user, firebaseUser, current ]) => (user && user.admin) || (current.owner && firebaseUser.uid === current.owner.id)),
    );

  // Flags

  flags$: Observable<Flag[]> = this.firestore.collection('flags');

  userFlags$: Observable<DocumentReference[]> = this.auth.user$
    .pipe(
      map((user) => user.flags),
    );

  // Location

  zones$ = this.firestore.collection<Zone>('zones');

  zone$ = this.current$
    .pipe(
      switchMap((moment) => this.firestore.fetch(moment.ref.parent.parent.parent.parent)),
    );

  locations$ = this.current$
    .pipe(
      switchMap((moment) => this.firestore.collection(moment.ref.parent.parent.parent.path)),
    );

  currentLocation$ = this.current$
    .pipe(
      switchMap((moment) => this.firestore.fetch<Location>(moment.ref.parent.parent)),
    );

  constructor(private auth: AuthService, private http: HttpClient, private snack: MatSnackBar, private firestore: FirestoreService) { }

  async request<T>(path: string, body: Object = null): Promise<T> {
    console.log(path);
    const token = await firebase.auth().currentUser
      .getIdToken();
    return this.http.post<T>(`${environment.url}${path}`, body, { headers: { Authorization: `Bearer ${token}` } })
      .toPromise()
      .catch((e: HttpErrorResponse) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
        throw e;
      });
  }

  async createMoment(body: any): Promise<void> {
    return this.request('/create', body);
  }

  // Movement

  async progressToOption(option: Option): Promise<void> {
    if (!option || isNaN(option.id)) {
      return;
    }
    if (option.zone) {
      return this.userToZone(option.zone);
    }
    if (option.location) {
      return this.userToLocation(option.location);
    }
    return this.userToMoment(option.moment);
  }

  async userToZone(zoneRef: DocumentReference | string) {
    const zone = await this.firestore.fetch<Zone>(zoneRef)
      .pipe(
        first(),
      )
      .toPromise();
    return this.userToLocation(zone.location);
  }

  async userToLocation(locationRef: DocumentReference | string) {
    const location = await this.firestore.fetch<Location>(locationRef)
      .pipe(
        first(),
      )
      .toPromise();
    return this.userToMoment(location.moment);
  }

  async userToMoment(momentRef: DocumentReference | string) {
    const user = await this.auth.user$
      .pipe(
        first(),
      )
      .toPromise();
    return user.ref.update({ moment: momentRef });
  }

  async respawn(body: { locationRef?: string; zoneRef?: string } = {}): Promise<void> {
    console.log('Respawning...');
    if (body.locationRef) {
      return this.userToLocation(body.locationRef);
    }
    const user = await this.auth.user$
      .pipe(
        first(),
      )
      .toPromise();
    const zoneRef = body.zoneRef || user.moment.parent.parent.parent.parent;
    await this.deleteNonPermanentFlags();
    return this.userToZone(zoneRef);
  }

  async deleteNonPermanentFlags(): Promise<void> {
    const userFlags = await this.userFlags$
      .pipe(first())
      .toPromise();
    const newFlags = [];
    for (const flagRef of userFlags) {
      const flag = await this.firestore.fetch<Flag>(flagRef)
      .pipe(
        first(),
      )
      .toPromise();
      if (flag.permanent) {
        newFlags.push(flagRef);
      }
    }
    const user = await this.auth.user$
    .pipe(
      first(),
    )
    .toPromise();
    return user.ref.update({ flags: newFlags });
  }

  // Creation and update

  async updateMoment(moment: Partial<Moment>, encyclopedias: { [name: string]: string }): Promise<void> {
    await moment.ref.update(moment)
      .catch((e: Error) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
        throw e;
      });

    try {
      const userDoc = await this.auth.userDoc$.pipe(first())
        .toPromise();
      for (const name of Object.keys(encyclopedias)) {
        const doc = await this.firestore.fetch<Encyclopedia>(`encyclopedia/${name.toLowerCase()}`)
          .toPromise();
        if (!doc || this.auth.admin || (doc.owner && doc.owner.id === userDoc.ref.id)) {
          const enc = { text: encyclopedias[name], owner: userDoc.ref, ref: null };
          await doc.ref.set(enc, { merge: true });
        }
      }
    } catch (e) {
      this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
      throw e;
    }
  }

  async deleteOption(option: Option) {
    return this.current$
      .pipe(
        first(),
        switchMap((moment) => moment.ref.update({
          options: firebase.firestore.FieldValue.arrayRemove(option),
        }),
        ),
      )
      .toPromise()
      .catch((e: Error) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
        throw e;
      });
  }

  async updateOption(option: Option) {
    return this.current$.pipe(
      first(),
      switchMap((moment) => {
        const options = moment.options;
        const found = options.find((opt) => opt.id === option.id);
        if (!found) {
          throw new Error('Option is missing');
        }
        console.log(`Changing text of ${option.id} from ${found.text} to ${option.text}`);
        found.text = option.text;
        found.flag = option.flag;
        found.notFlag = option.notFlag;
        return this.current$.pipe(
          first(),
          switchMap((m) => this.firestore.document(m.ref)),
          switchMap((doc) => doc.update({ options })),
        );
      }),
    )
      .toPromise()
      .catch((e: Error) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
        throw e;
      });
  }

  async createFlag(flag: Flag) {
    return this.firestore.createDocument<Flag>('flags', flag);
  }

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
