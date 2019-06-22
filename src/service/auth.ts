import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable, BehaviorSubject, empty } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
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
      tap((firebaseUser) => this.uid = firebaseUser ? firebaseUser.uid : null),
      map((firebaseUser) => firebaseUser ? this.db.collection('users')
        .doc<User>(firebaseUser.uid) : null),
    );
  user$: Observable<User> = this.userDoc$
    .pipe(
      switchMap((userDoc) => userDoc ? userDoc
        .valueChanges() : empty(null)),
    );

  constructor(private db: AngularFirestore) {
    firebase.auth()
      .onAuthStateChanged(
        (user) => {
          if (user) {
            this.firebaseUser$.next(user);
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
      .signOut()
      .then(() => this.firebaseUser$.next(null));
  }

}
