import { DatabaseService } from '../services/db';
import * as admin from 'firebase-admin';

export const userCreate = async (user: admin.auth.UserRecord, db: DatabaseService) => {
  console.log(user);
  await db.createUser(user.uid, user.displayName);
  return;
};