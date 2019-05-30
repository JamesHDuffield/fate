import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  provider = new firebase.auth.GoogleAuthProvider();
  firebaseUser$ = new BehaviorSubject<firebase.User>(null);
  user$: Observable<User> = this.firebaseUser$
    .pipe(
      tap((v) => console.log(v)),
      filter((firebaseUser) => !!firebaseUser && !!firebaseUser.uid),
      switchMap((firebaseUser) => this.db.collection('users').doc<User>(firebaseUser.uid).valueChanges()),
    );

  constructor(private db: AngularFirestore) {
    (<any>window).logout = this.logout;
    this.setup();
  }

  async setup() {
    firebase.auth()
      .onAuthStateChanged((user) => {
        if (user) {
          console.log('User', user);
          this.firebaseUser$.next(user);
        } else {
          this.login();
        }
      },
      (error) => console.error(error));
  }

  async login() {
    firebase.auth().signInWithRedirect(this.provider);
  }

  async logout() {
    return firebase.auth().signOut();
  }

}
