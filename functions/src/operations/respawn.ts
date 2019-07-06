import * as HttpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import { DatabaseService } from '../services/db';
import * as admin from 'firebase-admin';

interface RespawnRequest extends Request {
  user: admin.auth.DecodedIdToken;
  body: void;
}

export const respawn = async (request: RespawnRequest, response: Response) => {
  const cred = request.user;
  const db: DatabaseService = request.app.locals.db;

  // Update user to new moment
  await db.userToZone(cred.uid, db.respawnPoint);

  return response.sendStatus(HttpStatus.NO_CONTENT);
};