import { Pipe, PipeTransform } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'doc',
})
export class DocPipe implements PipeTransform {

  constructor(private db: AngularFirestore) {}

  transform<T>(value: DocumentReference): Observable<T> {
    if (!value) {
      return of(null);
    }
    return this.db.doc<T>(value.path)
      .valueChanges();
  }

}
