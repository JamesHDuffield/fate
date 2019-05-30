import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {
    const provider = new firebase.auth.GoogleAuthProvider();
    (<any>window).logout = () => firebase.auth().signOut();
    firebase.auth()
      .onAuthStateChanged((user) => {
        if (user) {
          console.log('User', user);
        } else {
          firebase.auth().signInWithRedirect(provider);
        }
      }, (error) => console.error(error));
  }
}
