import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable()
export class StoryService {

    cursor = 'XTZpmSctAsrbacJOQOpe';

    constructor(private db: AngularFirestore) {}

    async fetchStory(): Promise<string> {
        const item = await this.db.collection('thread').doc(this.cursor).get().toPromise();
        return item.data().text;
    }


}
