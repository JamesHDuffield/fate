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

    async createMoment(optionText: string, previousMoment: Moment): Promise<Moment> {
        const moment = {
            text: 'And then...'
        };
        const ref = await this.db.collection('moment').add(moment);
        const newMoment = await ref.get();

        const option = {
            text: optionText,
            id: newMoment.id,
        };
        previousMoment.options.push(option);
        // this.db.collection('moment').doc()
        return newMoment.data() as Moment;
    }

}
