import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Moment, Option } from '../models/moment';
import * as firebase from 'firebase/app';
import { LocationService } from './location';
import { Observable, combineLatest } from 'rxjs';
import { filter, switchMap, tap, map, single, first } from 'rxjs/operators';
import { AuthService } from './auth';
import { User } from '../models/user';

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

  constructor(private db: AngularFirestore, private location: LocationService, private auth: AuthService) {}

  async progressToOption(option: Option): Promise<void> {
    console.log(`Going to option ${option.id}`);
    if (!option || !option.id) {
      return;
    }
    const ref = this.db.doc<Moment>(`/moment/${option.id}`).ref;
    return this.auth.userDoc$
      .pipe(
        switchMap((userDoc: AngularFirestoreDocument<User>) => userDoc.set({ moment: ref }, { merge: true })),
      )
      .toPromise();
  }

  async progressToLocation(): Promise<void> {
    return combineLatest(this.start$, this.auth.userDoc$)
      .pipe(
        first(),
        map(([ momentDoc, userDoc ]) => userDoc.set({ moment: momentDoc.ref }, { merge: true })),
      )
      .toPromise();
  }

  async createMoment(optionText: string): Promise<void> {
    const moment = {
      text: 'And then...',
    };
    const ref = await this.db.collection('moment')
      .add(moment);

    const option = {
      text: optionText,
      id: ref.id,
    };
    await this.auth.user$
      .pipe(
        map((user) => this.db.doc<Moment>(user.moment)),
        first(),
        map((momentDoc) => momentDoc.set(<any>{ options: firebase.firestore.FieldValue.arrayUnion(option) }, { merge: true })),
      )
      .toPromise();

    await this.auth.userDoc$
      .pipe(
        map((momentDoc) => momentDoc.set({ moment: ref }, { merge: true })),
      )
      .toPromise();
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
