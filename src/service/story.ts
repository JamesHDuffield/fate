import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Moment, Option } from '../models/moment';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { LocationService } from './location';
import { Observable, combineLatest, NEVER } from 'rxjs';
import { filter, switchMap, map, first, catchError } from 'rxjs/operators';
import { AuthService } from './auth';
import { environment } from '../environments/environment';
import { MatSnackBar } from '@angular/material';
import { Encyclopedia } from '../models/encyclopedia';

@Injectable()
export class StoryService {

  start$: Observable<AngularFirestoreDocument<Moment>> = this.location.currentLocation$
    .pipe(
      filter((location) => !!location && !!location.moment),
      map((location) => this.db.doc<Moment>(location.moment)),
    );

  currentDoc$: Observable<AngularFirestoreDocument<Moment>> = this.auth.user$
    .pipe(
      filter((user) => !!user),
      map((user) => this.db.doc<Moment>(user.moment)),
    );

  current$: Observable<Moment> = this.auth.user$
    .pipe(
      filter((user) => !!user),
      switchMap((user) =>
        this.db.doc<Moment>(user.moment)
          .valueChanges()
          .pipe( // When user swaps moment is not accessible. Ignore those errors
            catchError((e: firebase.FirebaseError) => {
              if (e && e.code === 'permission-denied') {
                return NEVER;
              }
              console.log(JSON.stringify(e));
              throw e;
            }),
          ),
      ),
    );

  canEditMoment$: Observable<boolean> = combineLatest(this.auth.user$, this.auth.firebaseUser$, this.current$)
    .pipe(
      map(([ user, firebaseUser, current ]) => (user && user.admin) || (current.owner && firebaseUser.uid === current.owner.id)),
    );

  cursor: DocumentReference;

  constructor(private db: AngularFirestore, private location: LocationService, private auth: AuthService, private http: HttpClient, private snack: MatSnackBar) { }

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
        map(([ momentDoc, userDoc ]) => userDoc.set({ moment: momentDoc.ref }, { merge: true })),
      )
      .toPromise();
  }

  async createMoment(body: any): Promise<void> {
    return this.request('/create', body);
  }

  async respawn(body: { locationRef?: string } = {}): Promise<void> {
    return this.request('/respawn', body);
  }

  async updateMoment(moment: Partial<Moment>, encyclopedias: { [name: string]: string }): Promise<void> {
    await this.auth.user$
      .pipe(
        map((user) => this.db.doc<Moment>(user.moment)),
        first(),
        switchMap((momentDoc) => momentDoc.set(<Moment>moment, { merge: true })),
      )
      .toPromise()
      .catch((e: Error) => {
        this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
        throw e;
      });

    try {
      const userDoc = await this.auth.userDoc$.pipe(first())
        .toPromise();
      for (const name of Object.keys(encyclopedias)) {
        const ref = this.db.collection('encyclopedia')
          .doc<Encyclopedia>(name.toLowerCase());
        const doc = await ref.get()
          .toPromise();
        if (!doc.exists || this.auth.admin || (doc.data().owner && doc.data().owner.id === userDoc.ref.id)) {
          const enc = { text: encyclopedias[name], owner: userDoc.ref };
          await ref.set(enc, { merge: true });
        }
      }
    } catch (e) {
      this.snack.open(e.message, 'Dismiss', { panelClass: 'error-snackbar' });
      throw e;
    }
  }

  async deleteOption(option: Option) {
    return this.auth.user$
      .pipe(
        map((user) => this.db.doc<Moment>(user.moment)),
        first(),
        switchMap((momentDoc) => momentDoc.update(<any>{
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
        return this.currentDoc$.pipe(
          first(),
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
}
