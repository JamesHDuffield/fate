import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, DocumentChangeAction, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth';
import { Observable } from 'rxjs';
import { switchMap, map, filter, first } from 'rxjs/operators';
import { BaseDocument } from '../models/base';

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

  createDocument<T extends BaseDocument>(collection: string, entity: T) {
    return this.auth.userDoc$
      .pipe(
        first(),
        switchMap((userDoc) => {
          entity.owner = userDoc.ref;
          return this.db.collection<T>(collection)
            .add(entity);
        }),
      );
  }

  async saveDocument(document: BaseDocument): Promise<void> {
    document.ref.update(document);
  }

}
