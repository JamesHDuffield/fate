import * as HttpStatus from 'http-status-codes';
import { Response, Request } from 'express';
import { DatabaseService } from '../services/db';
import { Moment } from '../models/moment';
import * as admin from 'firebase-admin';

interface CreateRequest extends Request {
  user: admin.auth.DecodedIdToken;
  body: { text: string };
}

export const create = async (request: CreateRequest, response: Response) => {

  const cred = request.user;
  const text: string = request.body.text;
  const db: DatabaseService = request.app.locals.db;

  // Get current user
  const user = await db.user(cred.uid);
  // Get current moment
  const current = await db.getRef<Moment>(user.moment);
  // Create new moment
  const newMomentRef = await db.createMoment('And then...');
  // Add option to previous moment
  await db.addOption(user.moment, current, newMomentRef, text);
  // Update user to new moment
  await db.userToMoment(cred.uid, newMomentRef);

  return response.status(HttpStatus.NO_CONTENT);
};