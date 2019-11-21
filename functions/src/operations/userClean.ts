import { DatabaseService } from '../services/db';
import { Response, Request } from 'express';
import * as HttpStatus from 'http-status-codes';

export const userClean = async (db: DatabaseService) => {
  console.log('Users to be cleaned');
  // Get all users with "Nameless" and delete them
  await db.cleanUsers();
};