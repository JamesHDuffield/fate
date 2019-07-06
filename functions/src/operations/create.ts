import * as HttpStatus from 'http-status-codes';
import { Response, Request } from 'express';
import { DatabaseService } from '../services/db';
import { Location } from '../models/location';
import * as admin from 'firebase-admin';
import { Moment } from '../models/moment';

interface CreateRequest extends Request {
  user: admin.auth.DecodedIdToken;
  body: { text: string, type: string; };
}

export const create = async (request: CreateRequest, response: Response) => {

  const cred = request.user;
  const text: string = request.body.text;
  const type: string = request.body.type;
  const db: DatabaseService = request.app.locals.db;

  // Invalid if no text
  if (!text) {
    return response.status(HttpStatus.BAD_REQUEST).send({ message: 'Text is required'});
  }

  // Get current user
  const user = await db.user(cred.uid);
  // Check if too many options
  const moment = await db.getRef<Moment>(user.moment);
  if (!moment || moment.options.length >= 3) {
    return response.status(HttpStatus.BAD_REQUEST).send({ message: 'Too many options exist for this moment.'});
  }

  switch(type) {
    case 'reset':
      // Get current location
      const location = await db.getRef<Location>(user.location);
      // Add option to current moment
      await db.addOption(user.moment, { text, moment: location.moment });
      // Move to location
      await db.userToLocation(cred.uid, user.location);
      break;
    default:
      // Create new moment
      const newMomentRef = await db.createMoment(cred.uid, 'And then...');
      // Add option to current moment
      await db.addOption(user.moment, { text, moment: newMomentRef });
      // Update user to new moment
      await db.userToMoment(cred.uid, newMomentRef);
      break;
  }


  return response.sendStatus(HttpStatus.NO_CONTENT);
};