import * as functions from 'firebase-functions';
import { auth } from './services/auth';

// Set NODE_ENV from firebase env before config is loaded
const env = functions.config().project && functions.config().project.environment ? functions.config().project.environment : 'development';
process.env.NODE_ENV = env;
console.log(`Set environment to ${env}`);

import * as admin from 'firebase-admin';
import * as express from 'express';
import { json } from 'body-parser';
import * as cors from 'cors';
import * as bearerToken from 'express-bearer-token';
import { DatabaseService } from './services/db';
import { choose } from './operations/choose';
import { create } from './operations/create';
import { respawn } from './operations/respawn';
import { userCreate } from './operations/userCreate';
import { userClean } from './operations/userClean';

// Setup
admin.initializeApp();

const app = express();
app.use(json());
app.use(cors());
app.use(bearerToken({ headerKey: 'Bearer', queryKey: 'token', bodyKey: 'token' }));
app.use(auth);

app.locals.db = new DatabaseService(admin.firestore());

app.post('/choose/:momentId', choose);
app.post('/create', create);
app.post('/respawn', respawn);

export const api = functions.https.onRequest(app);

export const newUser = functions.auth.user().onCreate((data) => userCreate(data, app.locals.db));

// export const cleanUsers = functions.pubsub.schedule('0 3 * * *')
//   .timeZone('Australia/Melbourne')
//   .onRun((data) => userClean(app.locals.db));
