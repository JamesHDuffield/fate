import * as HttpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import { DatabaseService } from '../services/db';
import * as admin from 'firebase-admin';

interface ChooseRequest extends Request {
  user: admin.auth.DecodedIdToken;
  body: void;
}

export const choose = async (request: ChooseRequest, response: Response) => {
  console.log(request.body);

  const cred = request.user;
  const momentId: string = request.params.momentId;
  const db: DatabaseService = request.app.locals.db;

  // Get moment
  const momentRef = await db.moment(momentId);
  // Update user to new moment
  await db.userToMoment(cred.uid, momentRef);

  return response.sendStatus(HttpStatus.NO_CONTENT);
};