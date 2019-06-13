import * as HttpStatus from 'http-status-codes';
import { Response, Request } from 'express';
import { DatabaseService } from '../services/db';
import { Location } from '../models/location';
import * as admin from 'firebase-admin';
import { User } from '../models/user';
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

  const generateRoads = (xoffset: number, yoffset: number, inverse: boolean = false) => {
    const mod = inverse ? -1 : 1;
    if (mod * yoffset === 1) {
      return { N: true };
    }
    if (mod * yoffset === -1) {
      return { S: true };
    }
    if (mod * xoffset === 1) {
      return { E: true };
    }
    if (mod * xoffset === -1) {
      return { W: true };
    }
    console.error('No roads?');
    return {};
  }

  const createLocation = async (uid: string, userO: User, xoffset: number, yoffset: number): Promise<void> => {
    const location = await db.getRef<Location>(userO.location);
    // Check if location already exists
    const x = location.x + xoffset;
    const y = location.y + yoffset;
    const existingRef = await db.getLocationByXY(x, y);
    await userO.location.set(generateRoads(xoffset, yoffset), { merge: true });
    // Move to new
    if (existingRef) {
      await db.addOption(userO.moment, { text, location: existingRef });
      console.log('Location already exists moving user there');
      await existingRef.set(generateRoads(xoffset, yoffset, true), { merge: true });
      return db.userToLocation(cred.uid, existingRef);
    }
    // Create new
    console.log('Creating moment/location and moving user there');
    const momentRef = await db.createMoment(uid, 'And then...');
    const newLoc: Location = Object.assign({ x, y, moment: momentRef }, generateRoads(xoffset, yoffset, true));
    const newLocationRef = await db.createLocation(userO.zone, newLoc);
    await db.addOption(userO.moment, { text, location: newLocationRef });
    return db.userToLocation(cred.uid, newLocationRef);
  }

  // Get current user
  const user = await db.user(cred.uid);
  console.log(user);
  // Check if too many options
  const moment = await db.getRef<Moment>(user.moment);
  if (!moment || moment.options.length >= 3) {
    return response.status(HttpStatus.BAD_REQUEST).send({ message: 'Too many options exist for this moment.'});
  }

  // If type is location then we need to find/create it
  switch(type) {
    case 'north':
      await createLocation(cred.uid, user, 0, 1);
      break;
    case 'east':
      await createLocation(cred.uid, user, 1, 0);
      break;
    case 'south':
      await createLocation(cred.uid, user, 0, -1);
      break;
    case 'west':
      await createLocation(cred.uid, user, -1, 0);
      break;
    default:
      // Create new moment
      const newMomentRef = await db.createMoment(cred.uid, 'And then...');
      // Add option to previous moment
      await db.addOption(user.moment, { text, moment: newMomentRef });
      // Update user to new moment
      await db.userToMoment(cred.uid, newMomentRef);
      break;
  }


  return response.sendStatus(HttpStatus.NO_CONTENT);
};