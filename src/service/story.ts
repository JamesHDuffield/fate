import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Moment, Option } from '../models/moment';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { LocationService } from './location';
import { Observable, combineLatest, NEVER } from 'rxjs';
import { filter, switchMap, map, first, catchError, tap, distinctUntilChanged } from 'rxjs/operators';
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

  start$: Observable<AngularFirestoreDocument<Moment>> = this.location.currentLocation$
    .pipe(
      filter((location) => !!location && !!location.moment),
      switchMap((location) => this.firestore.document<Moment>(location.moment)),
    );

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
      map(([user, firebaseUser, current]) => (user && user.admin) || (current.owner && firebaseUser.uid === current.owner.id)),
    );

  flags$: Observable<Flag[]> = this.firestore.collection('flags');

  userFlags$: Observable<DocumentReference[]> = this.auth.user$
    .pipe(
      map((user) => user.flags),
    );

  constructor(private location: LocationService, private auth: AuthService, private http: HttpClient, private snack: MatSnackBar, private firestore: FirestoreService) { }

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

  async progressToOption(option: Option): Promise<void> {
    if (!option || isNaN(option.id)) {
      return;
    }
    await this.request(`/choose/${option.id}`);
  }

  async progressToLocation(): Promise<void> {
    return combineLatest(this.start$, this.auth.userDoc$)
      .pipe(
        first(),
        map(([ momentDoc, userDoc ]) => userDoc.set({ moment: momentDoc.ref, ref: null }, { merge: true })),
      )
      .toPromise();
  }

  async createMoment(body: any): Promise<void> {
    return this.request('/create', body);
  }

  async respawn(body: { locationRef?: string; zoneRef?: string } = {}): Promise<void> {
    console.log('Respawning...');
    const user = await this.auth.user$
      .pipe(
        first(),
      )
      .toPromise();
    if (body.locationRef) {
      const loc = await this.firestore.fetch<Location>(body.locationRef)
        .pipe(
          first(),
        )
        .toPromise();
      return user.ref.update({ moment: loc.moment });
    }
    const zoneRef = body.zoneRef || user.moment.parent.parent.parent.parent;
    const zone = await this.firestore.fetch<Zone>(zoneRef)
      .pipe(
        first(),
      )
      .toPromise();
    const location = await this.firestore.fetch<Location>(zone.location)
      .pipe(
        first(),
      )
      .toPromise();
    return user.ref.update({ moment: location.moment })
      .catch((e) => console.log('Error', e));
  }

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
}
