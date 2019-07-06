import * as HttpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import { DatabaseService } from '../services/db';
import { Moment } from '../models/moment';
// tslint:disable-next-line:no-implicit-dependencies
import { DocumentReference } from '@google-cloud/firestore';
import { User } from '../models/user';

interface ChooseRequest extends Request {
  userRef: DocumentReference;
  body: void;
}

export const choose = async (request: ChooseRequest, response: Response) => {
  console.log(request.body);

  const optId: string = request.params.momentId;
  const db: DatabaseService = request.app.locals.db;

  // Get moment from option
  const user = await db.getRef<User>(request.userRef);
  const current = await db.getRef<Moment>(user.moment);
  const option = current.options.find((opt) => opt.id === +optId);

  if (!option) {
    return response.sendStatus(HttpStatus.BAD_REQUEST);
  }

  if (option.zone) {
    await db.userToZone(request.userRef, option.zone);
  }

  if (option.location) {
    await db.userToLocation(request.userRef, option.location);
  }

  if (option.moment) {
    await db.userToMoment(request.userRef, option.moment);
  }
 

  return response.sendStatus(HttpStatus.NO_CONTENT);
};