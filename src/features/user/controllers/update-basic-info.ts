import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@service/redis/user.cache';
import { userQueue } from '@service/queues/user.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { basicInfoSchema, socialLinksSchema } from '@user/schemes/info';

const userCache: UserCache = new UserCache();

export class Edit {
  @joiValidation(basicInfoSchema)
  /* 
  info: this method is used to update the basic info of a user
  NOTE: the basic info will be sent as an object from the client side
  [key, value] of: looping through the basic info object req
  userCache.updateSingleUserItemInCache: updates each basic info field in the cache 
  userQueue.addUserJob: invoking the userQueue to update each basic info in the DB
  'updateBasicInfoInDB', {KEY, VALUE TO UPDATE}: job name
  */
  public async info(req: Request, res: Response): Promise<void> {
    for (const [key, value] of Object.entries(req.body)) {
      await userCache.updateSingleUserItemInCache(
        `${req.currentUser!.userId}`,
        key,
        `${value}`
      );
    }
    userQueue.addUserJob('updateBasicInfoInDB', {
      key: `${req.currentUser!.userId}`,
      value: req.body,
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
  }

  @joiValidation(socialLinksSchema)

  /* 
  social: this method is used to update the social info of a user
  */
  public async social(req: Request, res: Response): Promise<void> {
    await userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'social',
      req.body
    );
    userQueue.addUserJob('updateSocialLinksInDB', {
      key: `${req.currentUser!.userId}`,
      value: req.body,
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
  }
}
