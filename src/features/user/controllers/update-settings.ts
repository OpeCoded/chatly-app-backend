import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@service/redis/user.cache';
import { userQueue } from '@service/queues/user.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { notificationSettingsSchema } from '@user/schemes/info';

const userCache: UserCache = new UserCache();

/* 
notification: this method is used to update the notification field object in the cache and the DB
userCache.updateSingleUserItemInCache: updates the cache
userQueue.addUserJob: updates the DB
'notifications': field (object) to update
*/
export class UpdateSettings {
  @joiValidation(notificationSettingsSchema)
  public async notification(req: Request, res: Response): Promise<void> {
    await userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'notifications',
      req.body
    );
    userQueue.addUserJob('updateNotificationSettings', {
      key: `${req.currentUser!.userId}`,
      value: req.body,
    });
    res.status(HTTP_STATUS.OK).json({
      message: 'Notification settings updated successfully',
      settings: req.body,
    });
  }
}
