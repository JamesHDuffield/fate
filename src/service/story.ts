import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Moment } from 'src/models/moment';

@Injectable()
export class StoryService {

    cursor: DocumentReference;

    constructor(private db: AngularFirestore) {}

    async fetchMoment(id: string): Promise<Moment> {
        this.cursor = this.db.collection('moment').doc(id).ref;
        return (await this.cursor.get()).data() as Moment;
    }

    async createMoment(optionText: string): Promise<Moment> {
        const moment = {
            text: 'And then...'
        };
        const ref = await this.db.collection('moment').add(moment);

        const option = {
            text: optionText,
            id: ref.id,
        };
        await this.cursor.update({
            options: [ option ]
        });
        this.cursor = ref;
        return (await this.cursor.get()).data() as Moment;
    }

}
