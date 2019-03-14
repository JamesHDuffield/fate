import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Moment } from 'src/models/moment';

@Injectable()
export class StoryService {

    cursor: Moment;

    constructor(private db: AngularFirestore) {}

    async fetchMoment(id: string): Promise<Moment> {
        const item = await this.db.collection('moment').doc(id).get().toPromise();
        this.cursor = item.data() as Moment;
        return this.cursor;
    }


}
