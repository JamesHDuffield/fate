import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Moment } from 'src/models/moment';
import * as firebase from 'firebase/app';

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
            options: firebase.firestore.FieldValue.arrayUnion(option),
        });
        this.cursor = ref;
        return (await this.cursor.get()).data() as Moment;
    }

    async updateMomentText(text: string): Promise<Moment> {
        await this.cursor.set({ text }, { merge: true });
        return (await this.cursor.get()).data() as Moment;
    }

}
