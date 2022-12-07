import { Request, Response } from 'express';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@auth/user/interfaces/user.interface';
import { userService } from '@service/db/user.service';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();

/*
Checking if a user exists: we will firstly check the UserCache, if the user doesn't exists then check the DB and if no data was returned, then the user doesn't exist at all. If user data exists in the cache no need to check DB

cachedUser: user already saved in the cache
${req.currentUser!.userId}: user id to be used to get the current user from cache
cachedUser ? cachedUser: using tenary to decide if to check the DB for the current user if the cachedUser is empty

Object.keys(existingUser).length: checking the the object keys values returned are not empty ''


*/
export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(
      `${req.currentUser!.userId}`
    )) as IUserDocument;
    const existingUser: IUserDocument = cachedUser
      ? cachedUser
      : await userService.getUserById(`${req.currentUser!.userId}`);
    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }
    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}
