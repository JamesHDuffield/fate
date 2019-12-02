import { DatabaseService } from '../services/db';

export const userClean = async (db: DatabaseService) => {
  console.log('Users to be cleaned');
  // Get all users with "Nameless" and delete them
  await db.cleanUsers();
};