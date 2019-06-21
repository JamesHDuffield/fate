import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class EncyclopediaService {

  constructor(private db: AngularFirestore) {}

  async lookup(key: string): Promise<string> {
    if (!key) {
      return null;
    }
    const document = await this.db.collection('encyclopedia')
      .doc(key.toLowerCase())
      .get()
      .toPromise();
    return document.exists ? document.data().text : null;
  }
}
