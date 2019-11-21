import * as HttpStatus from 'http-status-codes';
import { Response } from 'express';
import { DatabaseService } from '../services/db';
import { AuthorisedRequest } from '../services/auth';

interface RespawnRequest extends AuthorisedRequest {
  body: { locationRef?: string; zoneRef?: string };
}

export const respawn = async (request: RespawnRequest, response: Response) => {
  const db: DatabaseService = request.app.locals.db;

  if (request.user.admin && request.body && request.body.locationRef) {
    const locationRef = db.firestore.doc(request.body.locationRef);
    await db.userToLocation(request.userRef, locationRef);
  } else if (request.user.admin && request.body && request.body.zoneRef) {
    const zoneRef = db.firestore.doc(request.body.zoneRef);
    await db.userToZone(request.userRef, zoneRef);
  } else {
    // Clear flags that are not permanent
    await db.clearNonPermanentFlags(request.userRef);
    // Update user to new moment
    const zoneRef = request.user.moment.parent.parent.parent.parent;
    await db.userToZone(request.userRef, zoneRef);
  }

  return response.sendStatus(HttpStatus.NO_CONTENT);
};