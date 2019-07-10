import { Injectable, NgZone } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  loaded: boolean = false;
  admin: boolean = false;
  uid: string = null;
  anonymous: boolean = true;
  provider = new firebase.auth.GoogleAuthProvider();
  firebaseUser$ = new BehaviorSubject<firebase.User>(undefined);
  userDoc$: Observable<AngularFirestoreDocument<User>> = this.firebaseUser$
    .pipe(
      tap((firebaseUser) => this.uid = firebaseUser ? firebaseUser.uid : null),
      tap((firebaseUser) => this.anonymous = firebaseUser ? firebaseUser.isAnonymous : true),
      map((firebaseUser) => firebaseUser ? this.db.collection('users')
        .doc<User>(firebaseUser.uid) : null),
    );
  user$: Observable<User> = this.userDoc$
    .pipe(
      switchMap((userDoc) => userDoc ? userDoc
        .valueChanges() : EMPTY),
    );

  constructor(private db: AngularFirestore, private zone: NgZone) {
    firebase.auth()
      .onAuthStateChanged(
        (user) => {
          console.log('User', user);
          this.zone.run(() => this.firebaseUser$.next(user));
          if (!user) {
            return this.loginAnonymously();
          }
        },
        (error) => {
          console.error(error);
        },
      );
  }

  async loginAnonymously() {
    console.log('Logging in anonymously');
    return firebase.auth()
      .signInAnonymously();
  }

  async login() {
    const previousUser = firebase.auth().currentUser;
    return firebase.auth()
      .signInWithRedirect(this.provider)
      .then(() => previousUser.isAnonymous ? previousUser.delete() : null);
  }

  async logout() {
    return firebase.auth()
      .signOut()
      .then(() => this.firebaseUser$.next(null));
  }

  async updateAccount(user: Partial<User>): Promise<void> {
    return this.db.collection('users')
      .doc<User>(this.uid)
      .set(user, { merge: true });
  }

}
