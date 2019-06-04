import * as HttpStatus from 'http-status-codes';
import { Request, Response } from 'express';

export const choose = async (request: Request, response: Response) => {
  console.log(request.body);
  return response.sendStatus(HttpStatus.OK);
};