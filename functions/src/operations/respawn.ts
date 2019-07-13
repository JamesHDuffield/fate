import * as HttpStatus from 'http-status-codes';
import { Response } from 'express';
import { DatabaseService } from '../services/db';
import { AuthorisedRequest } from '../services/auth';

interface RespawnRequest extends AuthorisedRequest {
  body: { locationRef?: string };
}

export const respawn = async (request: RespawnRequest, response: Response) => {
  const db: DatabaseService = request.app.locals.db;

  if (request.user.admin && request.body && request.body.locationRef) {
    const locationRef = db.firestore.doc(request.body.locationRef);
    await db.userToLocation(request.userRef, locationRef);
  } else {
    // Update user to new moment
    await db.userToZone(request.userRef, db.respawnPoint);
  }

  return response.sendStatus(HttpStatus.NO_CONTENT);
};