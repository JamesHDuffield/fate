import * as HttpStatus from 'http-status-codes';
import { Response } from 'express';
import { DatabaseService } from '../services/db';
// tslint:disable-next-line:no-implicit-dependencies
import { AuthorisedRequest } from '../services/auth';

interface RespawnRequest extends AuthorisedRequest {
  body: void;
}

export const respawn = async (request: RespawnRequest, response: Response) => {
  const db: DatabaseService = request.app.locals.db;

  // Update user to new moment
  await db.userToZone(request.userRef, db.respawnPoint);

  return response.sendStatus(HttpStatus.NO_CONTENT);
};