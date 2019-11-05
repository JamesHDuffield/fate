import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, DocumentChangeAction, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth';
import { Observable } from 'rxjs';
import { switchMap, map, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {

  constructor(private db: AngularFirestore, private auth: AuthService) { }

  canQuery$: Observable<{}> = this.auth.userDoc$
    .pipe(
      filter((userDoc) => !!userDoc),
    );

  document<T>(reference: DocumentReference | string): Observable<AngularFirestoreDocument<T>> {
    return this.canQuery$
      .pipe(
        map(() => typeof reference === 'string' ? this.db.doc<T>(reference) : this.db.doc<T>(reference)), // Helps types
      );
  }

  fetch<T>(reference: DocumentReference | string): Observable<T> {
    return this.document<T>(reference)
      .pipe(
        switchMap((doc) => doc.snapshotChanges()),
        map((action) => {
          const data: T = action.payload.data();
          const ref = action.payload.ref;
          return { ref, ...data };
        }),
      );
  }

  collection<T>(path: string): Observable<T[]> {
    return this.canQuery$
      .pipe(
        filter((userDoc) => !!userDoc),
        switchMap(() => this.db.collection<T>(path)
          .snapshotChanges()),
        // tslint:disable-next-line:ter-arrow-body-style
        map((actions: DocumentChangeAction<T>[]) => {
          return actions.map((a: DocumentChangeAction<T>) => {
            const data: T = a.payload.doc.data();
            const ref = a.payload.doc.ref;
            return { ref, ...data };
          });
        }),
      );
  }

}
