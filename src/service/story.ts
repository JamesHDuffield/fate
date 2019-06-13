import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Moment, Option } from '../models/moment';
import * as firebase from 'firebase/app';
import { LocationService } from './location';
import { Observable, combineLatest } from 'rxjs';
import { filter, switchMap, map, first, take, tap } from 'rxjs/operators';
import { AuthService } from './auth';
import { environment } from '../environments/environment';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class StoryService {

  start$: Observable<AngularFirestoreDocument<Moment>> = this.location.currentLocation$
    .pipe(
      filter((location) => !!location && !!location.moment),
      map((location) => this.db.doc<Moment>(location.moment)),
    );

  current$: Observable<Moment> = this.auth.user$
    .pipe(
      filter((user) => !!user),
      switchMap((user) => this.db.doc<Moment>(user.moment)
        .valueChanges()),
    );

  cursor: DocumentReference;

  constructor(private db: AngularFirestore, private location: LocationService, private auth: AuthService, private http: HttpClient, private snack: MatSnackBar) {}

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

  async respawn(): Promise<void> {
    return this.request('/respawn');
  }

  async updateMoment(moment: Partial<Moment>): Promise<void> {
    return this.auth.user$
      .pipe(
        map((user) => this.db.doc<Moment>(user.moment)),
        first(),
        switchMap((momentDoc) => momentDoc.set(<Moment>moment, { merge: true })),
      )
      .toPromise();
  }

}
