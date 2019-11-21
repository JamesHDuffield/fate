import * as HttpStatus from 'http-status-codes';
import { Response } from 'express';
import { DatabaseService } from '../services/db';
import { Moment } from '../models/moment';
import { AuthorisedRequest } from '../services/auth';

interface ChooseRequest extends AuthorisedRequest {
  body: void;
}

export const choose = async (request: ChooseRequest, response: Response) => {

  const optId: string = request.params.momentId;
  const db: DatabaseService = request.app.locals.db;

  // Get moment from option
  const current = await db.getRef<Moment>(request.user.moment);
  const option = current.options.find((opt) => opt.id === +optId);

  const flagIds = request.user.flags.map((flag) => flag.id);
  if (option.flag && !flagIds.includes(option.flag.id)) {
    return response.sendStatus(HttpStatus.UNAUTHORIZED);
  }

  if (option.notFlag && flagIds.includes(option.notFlag.id)) {
    return response.sendStatus(HttpStatus.UNAUTHORIZED);
  }

  if (!option) {
    return response.sendStatus(HttpStatus.BAD_REQUEST);
  }

  if (option.zone) {
    await db.userToZone(request.userRef, option.zone);
  }

  if (option.location) {
    await db.userToLocation(request.userRef, option.location);
  }

  if (option.moment) {
    await db.userToMoment(request.userRef, option.moment);
  }
 
  return response.sendStatus(HttpStatus.NO_CONTENT);
};