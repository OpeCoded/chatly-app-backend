import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

/*
req.session: setting cookie-session to null, so it's empty
user: {}, token: '' => set to EMPTY, so no user token/date is existing
*/
export class SignOut {
  public async update(req: Request, res: Response): Promise<void> {
    req.session = null;
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Logout successful', user: {}, token: '' });
  }
}
