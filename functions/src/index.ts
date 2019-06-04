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

// Setup
admin.initializeApp();

const app = express();
app.use(json());
app.use(cors());
app.use(bearerToken({ headerKey: 'Bearer', queryKey: 'token', bodyKey: 'token' }));
app.use(auth);

app.post('/choose/:momentId');

export const api = functions.https.onRequest(app);
