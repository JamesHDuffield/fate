import { DatabaseService } from '../services/db';
import * as admin from 'firebase-admin';

export const userCreate = async (user: admin.auth.UserRecord, db: DatabaseService) => {
  console.log('User', user);
  await db.createUser(user.uid, user.displayName || 'Nameless');
  console.log('Created user');
  return;
};