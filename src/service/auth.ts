import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  admin: boolean = false;
  uid: string = null;
  provider = new firebase.auth.GoogleAuthProvider();
  firebaseUser$ = new BehaviorSubject<firebase.User>(null);
  userDoc$: Observable<AngularFirestoreDocument<User>> = this.firebaseUser$
    .pipe(
      filter((firebaseUser) => !!firebaseUser && !!firebaseUser.uid),
      tap((firebaseUser) => this.uid = firebaseUser.uid),
      map((firebaseUser) => this.db.collection('users')
        .doc<User>(firebaseUser.uid)),
    );
  user$: Observable<User> = this.userDoc$
    .pipe(
      switchMap((userDoc) => userDoc
        .valueChanges()),
    );

  constructor(private db: AngularFirestore) {
    (<any>window).logout = this.logout;
    // tslint:disable-next-line: no-floating-promises
    this.setup();
  }

  async setup() {
    firebase.auth()
      .onAuthStateChanged(
        (user) => {
          if (user) {
            this.firebaseUser$.next(user);
          } else {
            return this.login();
          }
        },
        (error) => console.error(error),
      );
  }

  async login() {
    return firebase.auth()
      .signInWithRedirect(this.provider);
  }

  async logout() {
    return firebase.auth()
      .signOut();
  }

}
