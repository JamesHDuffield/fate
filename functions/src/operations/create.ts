import * as HttpStatus from 'http-status-codes';
import { Response } from 'express';
import { DatabaseService } from '../services/db';
import { Location } from '../models/location';
import { Moment } from '../models/moment';
// tslint:disable-next-line:no-implicit-dependencies
import { AuthorisedRequest } from '../services/auth';

interface CreateRequest extends AuthorisedRequest {
  body: {
    text: string,
    type: string;
    location?: string,
    name?: string,
  };
}

export const create = async (request: CreateRequest, response: Response) => {

  const text: string = request.body.text;
  const type: string = request.body.type;
  const db: DatabaseService = request.app.locals.db;

  // Invalid if no text
  if (!text) {
    return response.status(HttpStatus.BAD_REQUEST).send({ message: 'Text is required'});
  }

  // Check if too many options
  const moment = await db.getRef<Moment>(request.user.moment);
  if (!moment || moment.options.length >= 3) {
    return response.status(HttpStatus.BAD_REQUEST).send({ message: 'Too many options exist for this moment.'});
  }

  const locationRef = request.user.moment.parent.parent;
  const defaultMoment = { owner: request.userRef, text: '', options: [] };

  switch(type) {
    case 'zone':
      return response.sendStatus(HttpStatus.NOT_IMPLEMENTED);
    case 'location':
        if (!request.body.location) {
          return response.sendStatus(HttpStatus.BAD_REQUEST);
        }
        const existingLocationRef = db.firestore.doc(request.body.location);
        await db.addOption(request.user.moment, { text, location: existingLocationRef });
        await db.userToLocation(request.userRef, existingLocationRef);
        break;
    case 'newlocation':
        if (!request.body.name) {
          return response.sendStatus(HttpStatus.BAD_REQUEST);
        }
      const zoneRef = locationRef.parent.parent;
      const [newLocationRef, newLocationMomentRef] = await db.createLocation(zoneRef, { name: request.body.name, owner: request.userRef }, defaultMoment);
      await db.addOption(request.user.moment, { text, location: newLocationRef });
      // Update user to new moment
      await db.userToMoment(request.userRef, newLocationMomentRef);
      break;
    case 'reset':
      // Get current location
      const location = await db.getRef<Location>(locationRef);
      // Add option to current moment
      await db.addOption(request.user.moment, { text, moment: location.moment });
      // Move to location
      await db.userToLocation(request.userRef, locationRef);
      break;
    default:
      // Create new moment
      const newMomentRef = await db.createMoment(locationRef, defaultMoment);
      // Add option to current moment
      await db.addOption(request.user.moment, { text, moment: newMomentRef });
      // Update user to new moment
      await db.userToMoment(request.userRef, newMomentRef);
      break;
  }


  return response.sendStatus(HttpStatus.NO_CONTENT);
};