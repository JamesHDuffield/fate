import * as HttpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import { DatabaseService } from '../services/db';
import * as admin from 'firebase-admin';
import { Moment } from '../models/moment';

interface ChooseRequest extends Request {
  user: admin.auth.DecodedIdToken;
  body: void;
}

export const choose = async (request: ChooseRequest, response: Response) => {
  console.log(request.body);

  const cred = request.user;
  const optId: string = request.params.momentId;
  const db: DatabaseService = request.app.locals.db;

  // Get moment from option
  const user = await db.user(cred.uid);
  const current = await db.getRef<Moment>(user.moment);
  const option = current.options.find((opt) => opt.id === +optId);

  if (!option) {
    return response.sendStatus(HttpStatus.BAD_REQUEST);
  }

  if (option.location) {
    await db.userToLocation(cred.uid, option.location);
  }

  if (option.moment) {
    await db.userToMoment(cred.uid, option.moment);
  }
 

  return response.sendStatus(HttpStatus.NO_CONTENT);
};