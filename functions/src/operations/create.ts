import * as HttpStatus from 'http-status-codes';
import { Response, Request } from 'express';
import { DatabaseService } from '../services/db';
import { Location } from '../models/location';
import * as admin from 'firebase-admin';
import { User } from '../models/user';

interface CreateRequest extends Request {
  user: admin.auth.DecodedIdToken;
  body: { text: string, type: string; };
}

export const create = async (request: CreateRequest, response: Response) => {

  const cred = request.user;
  const text: string = request.body.text;
  const type: string = request.body.type;
  const db: DatabaseService = request.app.locals.db;

  const createLocation = async (userO: User, xoffset: number, yoffset: number): Promise<void> => {
    const location = await db.getRef<Location>(userO.location);
    // Check if location already exists
    const x = location.x + xoffset;
    const y = location.y + yoffset;
    const existingRef = await db.getLocationByXY(x, y);
    // Move to new
    if (existingRef) {
      await db.addOption(userO.moment, { text, location: existingRef });
      console.log('Location already exists moving user there');
      return db.userToLocation(cred.uid, existingRef);
    }
    // Create new
    console.log('Creating moment/location and moving user there');
    const momentRef = await db.createMoment('And then...');
    await userO.location.set({ N: true }, { merge: true });
    const newLocationRef = await db.createLocation(userO.zone, {
      x,
      y,
      S: true,
      moment: momentRef,
    });
    await db.addOption(userO.moment, { text, location: newLocationRef });
    return db.userToLocation(cred.uid, newLocationRef);
  }

  // Get current user
  const user = await db.user(cred.uid);
  // If type is location then we need to find/create it
  switch(type) {
    case 'north':
      await createLocation(user, 0, 1);
      break;
    case 'east':
      await createLocation(user, 1, 0);
      break;
    case 'south':
      await createLocation(user, 0, -1);
      break;
    case 'west':
      await createLocation(user, -1, 0);
      break;
    default:
      // Create new moment
      const newMomentRef = await db.createMoment('And then...');
      // Add option to previous moment
      await db.addOption(user.moment, { text, moment: newMomentRef });
      // Update user to new moment
      await db.userToMoment(cred.uid, newMomentRef);
      break;
  }


  return response.sendStatus(HttpStatus.NO_CONTENT);
};