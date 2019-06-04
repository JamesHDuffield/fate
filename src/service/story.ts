import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Moment, Option } from '../models/moment';
import * as firebase from 'firebase/app';
import { LocationService } from './location';
import { Observable, combineLatest } from 'rxjs';
import { filter, switchMap, map, first } from 'rxjs/operators';
import { AuthService } from './auth';
import { environment } from '../environments/environment';

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

  constructor(private db: AngularFirestore, private location: LocationService, private auth: AuthService, private http: HttpClient) {}

  async request<T>(path: string, body: Object | boolean = true): Promise<T> {
    const token = await firebase.auth().currentUser
      .getIdToken();
    return this.http.post<T>(`${environment.url}${path}`, body, { headers: { Authorization: `Bearer ${token}` } })
      .toPromise();
  }

  async progressToOption(option: Option): Promise<void> {
    if (!option || !option.id) {
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

  async createMoment(text: string): Promise<void> {
    return this.request('/create', { text });
  }

  async updateMomentText(text: string): Promise<void> {
    return this.auth.user$
      .pipe(
        map((user) => this.db.doc<Moment>(user.moment)),
        first(),
        switchMap((momentDoc) => momentDoc.set(<any>{ text }, { merge: true })),
      )
      .toPromise();
  }

}
